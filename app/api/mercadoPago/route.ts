// File: /api/mercado-pago/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendVoucherEmail } from '@/components/pagamento/voucher-email';
import { generateVoucherPDF } from '@/components/pagamento/voucher-pdf';
import crypto from 'crypto';

// Gerar chave de idempotência única
const generateIdempotencyKey = () => crypto.randomBytes(16).toString('hex');

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    console.log('Requisição recebida: ', body);

    // Validar se o clientId está presente
    if (!body.clientId) {
      return NextResponse.json({
        success: false,
        error: 'ClientId não fornecido.',
      });
    }

    // Opcional: Validar se o clientId é válido e corresponde ao usuário autenticado
    const client = await prisma.clientUser.findUnique({
      where: { id: body.clientId },
    });

    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'ClientId inválido.',
      });
    }

    // Criar as reservas no banco de dados
    const createdBookings = await Promise.all(
      body.bookings.map(async (bookingData: any) => {
        const createdBooking = await prisma.booking.create({
          data: {
            productId: bookingData.productId,
            companyId: bookingData.companyId,
            clientId: body.clientId,
            date: new Date(bookingData.date),
            time: bookingData.time,
            quantity: bookingData.quantity,
            price: bookingData.price,
            status: bookingData.status,
            paymentStatus: 'Pendente', // Status inicial
          },
        });
        return createdBooking;
      })
    );

    // Atualizar body.bookings com as reservas criadas
    body.bookings = createdBookings;

    // Preparar os dados do pagamento a serem enviados ao Mercado Pago
    const paymentData = {
      transaction_amount: body.transaction_amount,
      token: body.token,
      description: body.description || 'Pagamento de produtos',
      installments: body.installments,
      payment_method_id: body.payment_method_id,
      issuer_id: body.issuer_id,
      payer: {
        email: body.payer.email,
        identification: {
          type: body.payer.identification.type,
          number: body.payer.identification.number,
        },
      },
    };

    // Gerar chave de idempotência única
    const idempotencyKey = generateIdempotencyKey();

    // Criar pagamento usando a API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, // Seu access token do Mercado Pago
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey, // Adicionando o header de idempotência
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    console.log('Resposta da API do Mercado Pago:', result); // Log da resposta completa

    // Registrar o pagamento no banco de dados
    const createdPayment = await prisma.payment.create({
      data: {
        transactionId: result.id ? result.id.toString() : 'unknown_transaction_id',
        status: result.status,
        transactionAmount: result.transaction_amount ?? 0,
        payerEmail: body.payer.email,
        installments: body.installments || 1,
        paymentMethod: body.payment_method_id,
        bookingIds: body.bookings.map((booking: any) => booking.id),
        statusDetail: result.status_detail,
      },
    });

    // Atualizar os status de pagamento das reservas com base no resultado do pagamento
    const paymentStatus =
      result.status === 'approved' ? 'Aprovado' : 'Aguardando Pagamento';

    await prisma.booking.updateMany({
      where: { id: { in: body.bookings.map((booking: any) => booking.id) } },
      data: { paymentStatus: paymentStatus },
    });

    if (result.status === 'approved' || result.status === 'pending') {
      if (body.payment_method_id === 'pix') {
        const pointOfInteraction = result.point_of_interaction;

        if (pointOfInteraction && pointOfInteraction.transaction_data) {
          const pixQRCode = pointOfInteraction.transaction_data.qr_code_base64;
          const pixLink = pointOfInteraction.transaction_data.ticket_url;
          const expirationDate = result.date_of_expiration; // Obter data de expiração

          // Retornar QR Code, link de pagamento e data de expiração para o frontend
          return NextResponse.json({
            success: true,
            payment: {
              id: result.id,
              pixQRCode,
              pixLink,
              expirationDate,
            },
          });
        } else {
          console.error('Informações de pagamento via Pix indisponíveis.');
          return NextResponse.json({
            success: false,
            error: 'Informações de pagamento via Pix indisponíveis.',
          });
        }
      } else if (result.status === 'approved') {
        // Para pagamentos com cartão de crédito aprovados imediatamente
        // Enviar vouchers por e-mail
        await Promise.all(
          body.bookings.map(async (booking: any) => {
            console.log(`Enviando voucher para booking ID: ${booking.id}`);

            const bookingDetails = await prisma.booking.findUnique({
              where: { id: booking.id },
              include: {
                client: true,
                company: true,
                product: true,
              },
            });

            if (bookingDetails) {
              // Gerar PDF e enviar e-mail
              const pdfBytes = await generateVoucherPDF(
                bookingDetails,
                bookingDetails.product,
                bookingDetails.company
              );

              console.log('Enviando voucher para:', bookingDetails.client.email);

              // Enviar e-mail com o voucher em PDF
              await sendVoucherEmail(
                bookingDetails.client.email,
                Buffer.from(pdfBytes)
              );
            }
          })
        );

        console.log('Pagamento criado com sucesso:', createdPayment);
        return NextResponse.json({ success: true, payment: createdPayment });
      } else {
        // Pagamento está pendente (ex: boleto ou outros métodos)
        return NextResponse.json({ success: true, payment: createdPayment });
      }
    } else {
      console.error('Erro no pagamento:', result.status_detail);
      return NextResponse.json({ success: false, error: result.status_detail });
    }
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendVoucherEmail } from '@/components/pagamento/voucher-email';
import { generateVoucherPDF } from '@/components/pagamento/voucher-pdf';
import crypto from 'crypto';

// Gerar chave de idempotência única
const generateIdempotencyKey = () => crypto.randomBytes(16).toString("hex");

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    // Logs para rastrear o corpo da requisição e o pagamento enviado
    console.log('Requisição recebida: ', body);

    // Dados do pagamento a serem enviados ao Mercado Pago
    const paymentData = {
      transaction_amount: body.transaction_amount,
      token: body.token,
      description: body.description,
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
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, // Access token de produção
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey, // Adicionando o header de idempotência
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    console.log('Resposta da API do Mercado Pago:', result); // Log da resposta completa

    // Verifica se o pagamento foi aprovado ou está pendente (caso de Pix)
    if (result.status === 'approved' || result.status === 'pending') {
      // Tratamento para pagamento via Pix
      if (body.payment_method_id === 'pix') {
        const pointOfInteraction = result.point_of_interaction;

        if (pointOfInteraction && pointOfInteraction.transaction_data) {
          const pixQRCode = pointOfInteraction.transaction_data.qr_code_base64;
          const pixLink = pointOfInteraction.transaction_data.ticket_url;

          // Retornar QR Code e link de pagamento para o frontend
          return NextResponse.json({
            success: true,
            payment: {
              id: result.id,
              pixQRCode,
              pixLink,
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
        // Tratamento para pagamento via cartão de crédito
        await Promise.all(
          body.bookings.map(async (booking: any) => {
            console.log(`Atualizando booking com ID: ${booking.id}`);

            const updatedBooking = await prisma.booking.update({
              where: { id: booking.id },
              data: { paymentStatus: 'Aprovado' },
              include: {
                client: true,
                company: true,
                product: true,
              },
            });

            // Gerar PDF e enviar e-mail
            const pdfBytes = await generateVoucherPDF(
              updatedBooking,
              updatedBooking.product,
              updatedBooking.company
            );

            console.log('Enviando voucher para:', updatedBooking.client.email);

            // Enviar e-mail com o voucher em PDF
            await sendVoucherEmail(
              updatedBooking.client.email,
              Buffer.from(pdfBytes)
            );
          })
        );

        const createdPayment = await prisma.payment.create({
          data: {
            transactionId: result.id ? result.id.toString() : 'unknown_transaction_id',
            status: result.status,
            transactionAmount: result.transaction_amount ?? 0,
            payerEmail: body.payer.email,
            installments: body.installments,
            paymentMethod: body.payment_method_id,
            bookingIds: body.bookings.map((booking: any) => booking.id),
          },
        });

        console.log('Pagamento criado com sucesso:', createdPayment);
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

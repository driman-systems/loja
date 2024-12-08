import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendVoucherEmail } from '@/components/pagamento/voucher-email';
import { generateVoucherPDF } from '@/components/pagamento/voucher-pdf';
import crypto from 'crypto';

// Gerar chave de idempotência única
const generateIdempotencyKey = () => crypto.randomBytes(16).toString('hex');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar clientId
    if (!body.clientId) {
      console.error('Erro: ClientId não fornecido.');
      return NextResponse.json({
        success: false,
        error: 'ClientId não fornecido.',
      });
    }

    // Validar clientId no banco
    const client = await prisma.clientUser.findUnique({
      where: { id: body.clientId },
    });

    if (!client) {
      console.error('Erro: ClientId inválido.');
      return NextResponse.json({
        success: false,
        error: 'ClientId inválido.',
      });
    }

    // Criar reservas no banco
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
            status: bookingData.status || 'Pendente',
            paymentStatus: 'Pendente',
          },
        });
        return createdBooking;
      })
    );

    body.bookings = createdBookings;

    // Dados do pagamento
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

    // Criar pagamento no Mercado Pago
    const idempotencyKey = generateIdempotencyKey();
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro na resposta do Mercado Pago:', result);
      // Atualizar campos no banco em caso de erro
      await prisma.payment.create({
        data: {
          transactionId: result.id ? result.id.toString() : 'unknown_transaction_id',
          status: 'failed',
          transactionAmount: body.transaction_amount,
          payerEmail: body.payer.email,
          installments: body.installments || 1,
          paymentMethod: body.payment_method_id,
          bookingIds: body.bookings.map((booking: any) => booking.id),
          statusDetail: result.cause ? result.cause[0]?.description : 'Erro desconhecido',
          errorDetails: result.cause ? JSON.stringify(result.cause) : null,
        },
      });

      return NextResponse.json({
        success: false,
        error: result.cause ? result.cause[0]?.description : 'Erro desconhecido',
      });
    }

    // Criar registro de pagamento no banco
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
        dateApproved: result.date_approved || null,
        statusMessage: result.status === 'approved' ? 'Pagamento aprovado com sucesso' : 'Pagamento pendente',
      },
    });

    // Atualizar status das reservas
    const paymentStatus = result.status === 'approved' ? 'Aprovado' : 'Aguardando Pagamento';
    await prisma.booking.updateMany({
      where: { id: { in: body.bookings.map((booking: any) => booking.id) } },
      data: {
        paymentStatus: paymentStatus,
        status: result.status === 'approved' ? 'Confirmado' : 'Pendente',
      },
    });

    // Enviar email com voucher (se aprovado)
    if (result.status === 'approved') {
      await Promise.all(
        body.bookings.map(async (booking: any) => {
          const bookingDetails = await prisma.booking.findUnique({
            where: { id: booking.id },
            include: {
              client: true,
              company: true,
              product: true,
            },
          });

          if (bookingDetails) {
            const pdfBytes = await generateVoucherPDF(
              bookingDetails,
              bookingDetails.product,
              bookingDetails.company
            );

            await sendVoucherEmail(
              bookingDetails.client.email,
              Buffer.from(pdfBytes)
            );
          }
        })
      );
    }

    return NextResponse.json({ success: true, payment: createdPayment });
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

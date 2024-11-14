import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const token = process.env.MP_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  let body;
  try {
    // Recebe os dados do webhook e extrai o transactionId
    body = await req.json();
    console.log('Dados recebidos pelo webhook:', body);

    const transactionId = body.data?.id;
    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    // Faz uma requisição para obter os detalhes completos do pagamento
    const paymentDetailsResponse = await fetch(`https://api.mercadopago.com/v1/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!paymentDetailsResponse.ok) {
      console.error("Erro ao buscar detalhes do pagamento na API do Mercado Pago:", await paymentDetailsResponse.text());
      return NextResponse.json({ success: false, error: "Erro ao buscar detalhes do pagamento." }, { status: 500 });
    }

    const paymentDetails = await paymentDetailsResponse.json();
    console.log('Detalhes do pagamento:', paymentDetails);

    // Obtém o status e outros detalhes do pagamento
    const status = paymentDetails.status;
    const statusDetail = paymentDetails.status_detail || null;
    const transactionAmount = paymentDetails.transaction_amount;
    const payerEmail = paymentDetails.payer?.email || null;
    const dateApproved = paymentDetails.date_approved || null;
    const paymentMethod = paymentDetails.payment_method_id || null;

    // Atualiza o status do pagamento no banco de dados com os novos detalhes
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        transactionAmount,
        payerEmail,
        dateApproved,
        paymentMethod,
      },
    });

    // Se o pagamento foi aprovado, atualiza os bookings associados
    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIds = updatedPayment.bookingIds;
      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: 'Confirmado',
          paymentStatus: 'Aprovado',
        },
      });
    }

    // Emite um evento via Socket.io para o frontend, se configurado
    if (global.io) {
      global.io.emit("paymentConfirmed", { transactionId, status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);

    // Em caso de erro, tenta atualizar o pagamento com o status de erro
    if (body?.data?.id) {
      await prisma.payment.update({
        where: { transactionId: body.data.id.toString() },
        data: {
          status: "Erro",
          errorDetails: error.message,
        },
      });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body;
  try {
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
        'Authorization': `Bearer YOUR_ACCESS_TOKEN`, // Substitua pelo seu token de acesso
      },
    });

    const paymentDetails = await paymentDetailsResponse.json();

    // Obtém o status e outros detalhes do pagamento
    const status = paymentDetails.status;
    const statusDetail = paymentDetails.status_detail || null;
    const errorDetails = paymentDetails.error ? paymentDetails.error.message : null;

    console.log('Detalhes do pagamento:', paymentDetails);

    // Atualiza o status do pagamento no banco de dados
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        errorDetails,
      },
    });

    // Se o pagamento foi aprovado, atualizar os bookings associados
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

    // Envia um evento via Socket.io para o frontend
    if (global.io) {
      global.io.emit("paymentConfirmed", { transactionId, status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);
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

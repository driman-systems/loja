import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    console.log('Dados recebidos pelo webhook:', body); // Log para verificar o conteúdo do webhook

    const transactionId = body.data?.id;
    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    const status = body.data?.status;
    const statusDetail = body.data?.status_detail || null;
    const errorDetails = body.data?.error ? body.data.error.message : null;

    console.log('Transaction ID recebido:', transactionId);
    console.log('Status recebido:', status);

    // Atualizar o status do pagamento
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        errorDetails,
      },
    });

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

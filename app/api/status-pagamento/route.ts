import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const transactionId = body.data?.id;
    const status = body.data?.status;
    const statusDetail = body.data?.status_detail || null;
    const errorDetails = body.data?.error ? body.data.error.message : null;

    // Atualizar o status do pagamento com detalhes e erros
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        errorDetails,
      },
    });

    // Se o pagamento foi aprovado, atualizar bookings
    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIds = updatedPayment.bookingIds;

      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: 'Confirmado', // Define o status conforme sua lógica de negócios
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

    // Atualiza o status do pagamento em caso de erro
    const transactionId = await req.json().then(data => data.data?.id);

    if (transactionId) {
      await prisma.payment.update({
        where: { transactionId: transactionId.toString() },
        data: {
          status: "Erro",
          errorDetails: error.message,
        },
      });
    }

    return NextResponse.json({ success: false, error: error.message });
  }
}

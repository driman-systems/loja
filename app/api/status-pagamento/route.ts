import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {

  const body = await req.json();

  try {
    const transactionId = body.data?.id;
    const status = body.data?.status;
    const statusDetail = body.data?.status_detail || null;
    const errorDetails = body.data?.error ? body.data.error.message : null;

    if (!transactionId) {
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: { status, statusDetail, errorDetails },
    });

    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIds = updatedPayment.bookingIds;
      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: { status: 'Confirmado', paymentStatus: 'Aprovado' },
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
        data: { status: "Erro", errorDetails: error.message },
      });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

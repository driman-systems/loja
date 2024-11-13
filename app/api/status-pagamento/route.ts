import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

let body: any;

export async function POST(req: NextRequest) {
  try {
    // Captura o body da requisição
    body = await req.json();

    // Obtém dados do pagamento a partir da resposta do webhook
    const paymentData = body.data;
    const transactionId = paymentData.id;
    const status = paymentData.status;
    const statusDetail = paymentData.status_detail; // Detalhe específico do status
    const errorDetails = paymentData.error ? paymentData.error.message : null; // Mensagem de erro, se houver

    // Atualizar o status do pagamento com detalhes e erros
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId },
      data: {
        status,
        statusDetail,
        errorDetails,
      },
    });

    // Verificar se o pagamento foi aprovado e atualizar os bookings relacionados
    if (status === "approved" && updatedPayment.bookingIds) {
      const bookingIds = updatedPayment.bookingIds;

      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: "Confirmado", // Atualize conforme a lógica de negócios
          paymentStatus: "Aprovado",
        },
      });
    }

    // Emitir o evento via Socket.io se o pagamento foi confirmado
    if (global.io) {
      global.io.emit("paymentConfirmed", { transactionId });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);

    // Atualizar o status do pagamento com erro, se disponível
    if (body && body.data && body.data.id) {
      await prisma.payment.update({
        where: { transactionId: body.data.id },
        data: {
          status: "Erro",
          errorDetails: error.message, // Salva a mensagem de erro
        },
      });
    }

    return NextResponse.json({ success: false, error: error.message });
  }
}

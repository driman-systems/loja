import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body;
  try {
    // Obtém e valida o corpo da requisição
    body = await req.json();
    console.log("Corpo da requisição recebido:", body);
  } catch (error: any) {
    console.error("Erro ao analisar o corpo da requisição:", error.message);
    return NextResponse.json({ success: false, error: "Erro ao analisar o corpo da requisição." }, { status: 400 });
  }

  try {
    const transactionId = body.data?.id;
    const status = body.data?.status;
    const statusDetail = body.data?.status_detail || null;
    const errorDetails = body.data?.error ? body.data.error.message : null;

    console.log("Dados do webhook:");
    console.log("Transaction ID:", transactionId);
    console.log("Status:", status);
    console.log("Status Detail:", statusDetail);
    console.log("Error Details:", errorDetails);

    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    // Atualizar o status do pagamento com detalhes e erros
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        errorDetails,
      },
    });
    console.log("Pagamento atualizado no banco de dados:", updatedPayment);

    // Se o pagamento foi aprovado, atualizar bookings
    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIds = updatedPayment.bookingIds;

      console.log("Atualizando bookings com os IDs:", bookingIds);
      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: 'Confirmado', // Define o status conforme sua lógica de negócios
          paymentStatus: 'Aprovado',
        },
      });
      console.log("Bookings atualizados com sucesso.");
    } else {
      console.log("Status não aprovado ou não há bookings para atualizar.");
    }

    // Envia um evento via Socket.io para o frontend
    if (global.io) {
      console.log("Emitindo evento via Socket.io");
      global.io.emit("paymentConfirmed", { transactionId, status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);

    const transactionId = body?.data?.id;

    if (transactionId) {
      await prisma.payment.update({
        where: { transactionId: transactionId.toString() },
        data: {
          status: "Erro",
          errorDetails: error.message,
        },
      });
      console.log("Erro registrado no banco de dados para o pagamento:", transactionId);
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

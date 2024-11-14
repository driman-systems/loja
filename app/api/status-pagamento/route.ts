import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (error: any) {
    console.error("Erro ao analisar o corpo da requisição:", error.message);
    return NextResponse.json(
      { success: false, error: "Erro ao analisar o corpo da requisição." },
      { status: 400 }
    );
  }

  try {
    const transactionId = body.data?.id;
    const status = body.data?.status;
    const statusDetail = body.data?.status_detail || null;
    const errorDetails = body.data?.error ? body.data.error.message : null;

    console.log("Dados recebidos pelo webhook:", body);
    console.log("ID da Transação:", transactionId);
    console.log("Status:", status);
    console.log("Detalhes do Status:", statusDetail);
    console.log("Detalhes do Erro:", errorDetails);

    // Verifica se o transactionId existe no banco de dados
    const paymentRecord = await prisma.payment.findUnique({
      where: { transactionId: transactionId.toString() },
    });

    if (!paymentRecord) {
      console.error(`Erro: Nenhum registro encontrado para transactionId ${transactionId}`);
      return NextResponse.json(
        { success: false, error: "Registro de pagamento não encontrado." },
        { status: 404 }
      );
    }

    // Atualiza o status do pagamento com detalhes e erros
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        errorDetails,
      },
    });

    console.log("Pagamento atualizado no banco de dados:", updatedPayment);

    // Atualiza os bookings, se o pagamento foi aprovado
    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIds = updatedPayment.bookingIds;

      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: 'Confirmado',
          paymentStatus: 'Aprovado',
        },
      });
      console.log("Bookings atualizados com sucesso:", bookingIds);
    } else {
      console.log("Status não aprovado ou não há bookings para atualizar.");
    }

    // Emite o evento via Socket.io, se disponível
    if (global.io) {
      global.io.emit("paymentConfirmed", { transactionId, status });
      console.log("Evento enviado para o Socket.io:", { transactionId, status });
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

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  let body;
  try {
    // Tenta parsear o corpo da requisição para JSON
    body = await req.json();
  } catch (error: any) {
    console.error("Erro ao analisar o corpo da requisição:", error.message);
    return NextResponse.json(
      { success: false, error: "Erro ao analisar o corpo da requisição." },
      { status: 400 }
    );
  }

  try {
    // Extrai os dados necessários
    const transactionId = body.data?.id; // Obtendo o ID da transação
    const status = body.data?.status;
    const statusDetail = body.data?.status_detail || null;
    const errorDetails = body.data?.error ? body.data.error.message : null;

    // Verificações e logs para garantir que estamos pegando os dados corretos
    console.log("Dados recebidos pelo webhook:", body);
    console.log("ID da Transação:", transactionId);
    console.log("Status:", status);
    console.log("Detalhes do Status:", statusDetail);
    console.log("Detalhes do Erro:", errorDetails);

    // Verifica se o transactionId existe
    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json(
        { success: false, error: "ID de transação ausente." },
        { status: 400 }
      );
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

    // Se o pagamento foi aprovado, atualizar os bookings associados
    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIds = updatedPayment.bookingIds;

      await prisma.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: 'Confirmado', // Define o status conforme sua lógica de negócios
          paymentStatus: 'Aprovado',
        },
      });
      console.log("Bookings atualizados com sucesso:", bookingIds);
    } else {
      console.log("Status não aprovado ou não há bookings para atualizar.");
    }

    // Envia um evento via Socket.io para o frontend, se aplicável
    if (global.io) {
      global.io.emit("paymentConfirmed", { transactionId, status });
      console.log("Evento enviado para o Socket.io:", { transactionId, status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);

    // Atualiza o status do pagamento em caso de erro
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

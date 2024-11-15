import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Logando o body da requisição para verificar se o transactionId está correto
    const body = await req.json();

    const transactionId = body.data?.id.toString();

    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    // Buscando detalhes no banco para o transactionId
    const paymentStatus = await prisma.payment.findUnique({
      where: { transactionId },
    });

    if (!paymentStatus) {
      console.error("Erro: Pagamento não encontrado no banco de dados.");
      return NextResponse.json({ success: false, error: "Pagamento não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: paymentStatus.status,
      message: paymentStatus.statusMessage,
    });
  } catch (error: any) {
    console.error("Erro ao consultar status do pagamento:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

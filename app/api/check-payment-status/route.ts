import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Consulta o status do pagamento no banco de dados
    const payment = await prisma.payment.findUnique({
      where: { transactionId: transactionId.toString() },
      select: {
        status: true,
        statusDetail: true,
        transactionAmount: true,
        errorDetails: true,
        dateApproved: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Retorna o status e os detalhes do pagamento
    return NextResponse.json({
      success: true,
      status: payment.status,
      statusDetail: payment.statusDetail,
      transactionAmount: payment.transactionAmount,
      dateApproved: payment.dateApproved,
      errorDetails: payment.errorDetails,
    });
  } catch (error: any) {
    console.error('Erro ao buscar status do pagamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar status do pagamento' },
      { status: 500 }
    );
  }
}

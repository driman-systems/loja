import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Capturar os detalhes do pagamento enviados no webhook
    const { id: transactionId, status, status_detail: statusDetail, error_message: errorDetails } = body.data;

    // Atualizar a tabela de pagamentos no banco de dados
    const updatedPayment = await prisma.payment.updateMany({
      where: { transactionId },
      data: {
        status: status ?? 'Pendente', // Atualiza o status com a informação mais recente
        statusDetail,                 // Detalhes do status, como "approved", "pending", "rejected"
        errorDetails: errorDetails ?? null,  // Salva os detalhes do erro, se existirem
      },
    });

    // Se o pagamento foi atualizado com sucesso
    if (updatedPayment) {
      console.log('Pagamento atualizado com sucesso:', updatedPayment);
      return NextResponse.json({ success: true });
    } else {
      console.error('Pagamento não encontrado para a transação:', transactionId);
      return NextResponse.json({ success: false, error: 'Pagamento não encontrado' });
    }

  } catch (error: any) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

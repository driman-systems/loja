import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Server as IOServer } from 'socket.io';

declare global {
  var io: IOServer | undefined;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id: transactionId } = body.data;

  if (!transactionId) {
    console.error('Webhook não contém ID de transação.');
    return NextResponse.json({ success: false, error: 'ID de transação ausente.' });
  }

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    });

    const paymentData = await response.json();
    const { status } = paymentData;

    await prisma.payment.updateMany({
      where: { transactionId: transactionId.toString() },
      data: { status: status ?? 'Pendente' },
    });

    if (status === 'approved') {
      // Emite o evento de pagamento confirmado
      if (global.io) {
        global.io.emit('paymentConfirmed', { transactionId });
        console.log(`Evento paymentConfirmed emitido para transactionId: ${transactionId}`);
      } else {
        console.error('Socket.io não está inicializado.');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

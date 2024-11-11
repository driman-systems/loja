import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  const idPayment = params.id

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: idPayment },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    if (Array.isArray(payment.bookingIds) && payment.bookingIds.length > 0) {
      const bookings = await prisma.booking.findMany({
        where: {
          id: { in: payment.bookingIds },
        },
      });

      return NextResponse.json({ payment, bookings });
    } else {
      return NextResponse.json({ payment, bookings: [] });
    }


  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 500 });
  }
}

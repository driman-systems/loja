import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        product: true, 
        company: true, 
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookings } = body;

    if (!bookings || bookings.length === 0) {
      console.log('Nenhum booking enviado');
      return NextResponse.json({ error: 'Nenhum booking enviado' }, { status: 400 });
    }

    // Use o clientEmail ao invés de clientId para procurar o cliente
    const client = await prisma.clientUser.findUnique({
      where: { email: bookings[0].clientEmail }, // Corrigido para email
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const clientId = client.id;  // Aqui você obtém o ID do cliente

    // Cria os bookings com o clientId correto
    const createdBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        return prisma.booking.create({
          data: {
            productId: booking.productId,
            companyId: booking.companyId,
            clientId: clientId, 
            date: new Date(booking.date),
            time: booking.time,
            quantity: booking.quantity,
            price: booking.price,
            status: booking.status || 'Pendente',
          },
        });
      })
    );

    return NextResponse.json({ bookings: createdBookings }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao criar bookings:', error);
    return NextResponse.json({ error: 'Erro ao criar bookings', details: error.message }, { status: 500 });
  }
}

// File: /app/api/socket/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

declare global {
  var io: IOServer | undefined;
}

export async function GET(req: NextRequest) {
  if (!global.io) {
    const server: HttpServer | undefined = (req as any).socket?.server;

    if (server && !(server as any).io) {
      // Inicializando o Socket.io com o servidor HTTP
      const io = new IOServer(server, {
        path: '/api/socket',
      });

      io.on('connection', (socket) => {
        console.log('Novo cliente conectado:', socket.id);

        // Emite um evento quando o pagamento for confirmado
        socket.on('confirmPayment', (data) => {
          console.log('Confirmação de pagamento recebida:', data);
          // Emite o evento de confirmação de pagamento para os clientes conectados
          io.emit('paymentConfirmed', { transactionId: data.transactionId });
        });

        socket.on('disconnect', () => {
          console.log('Cliente desconectado:', socket.id);
        });
      });

      (server as any).io = io;
      global.io = io;
    }
  }

  return NextResponse.json({ message: 'Socket initialized' });
}

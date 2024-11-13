// File: /app/api/socket/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Server as IOServer } from 'socket.io';

declare global {
  var io: IOServer | undefined;
}

export async function GET(req: NextRequest) {
  // Verifique se o Socket.io já foi inicializado
  if (!global.io) {
    // Acesse o servidor HTTP
    const server: any = (req as any).socket?.server;

    if (server && !server.io) {
      // Inicialize o Socket.io com o servidor HTTP
      const io = new IOServer(server, {
        path: '/api/socket', // Certifique-se de que o cliente usa o mesmo path
      });

      io.on('connection', (socket) => {
        console.log('Novo cliente conectado:', socket.id);

        socket.on('disconnect', () => {
          console.log('Cliente desconectado:', socket.id);
        });
      });

      // Salve a instância global do Socket.io para evitar duplicações
      server.io = io;
      global.io = io;
    }
  }

  return new NextResponse(null, { status: 200 });
}

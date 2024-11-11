import { NextRequest, NextResponse } from 'next/server';
import { sendVoucherEmail } from '@/components/pagamento/voucher-email';
import { generateVoucherPDF } from '@/components/pagamento/voucher-pdf';

export async function GET(req: NextRequest) {
    
  try {
    // Cria um booking de exemplo
    const booking = {
      clientEmail: 'anderstrak@hotmail.com',
      date: new Date(),
      quantity: 2,
      price: 150.0,
    };

    const company = {
      name: 'Driman Eventos',
    };

    const product = {
      title: 'Evento Exemplo',
    };

    // Gera o PDF do voucher
    const pdfBytes = await generateVoucherPDF(booking, product, company);
    const pdfBuffer = Buffer.from(pdfBytes);

    // Envia o e-mail
    await sendVoucherEmail(booking.clientEmail, pdfBuffer);

    return NextResponse.json({ message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
    return NextResponse.json({ error: 'Falha ao enviar o e-mail' }, { status: 500 });
  }
}

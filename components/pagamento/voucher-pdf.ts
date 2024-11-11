import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateVoucherPDF(booking: any, product: any, company: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Add text to the PDF
  page.drawText('Voucher do Agendamento', {
    x: 50,
    y: 750,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Produto: ${product.title}`, { x: 50, y: 700, size: 15 });
  page.drawText(`Empresa: ${company.name}`, { x: 50, y: 680, size: 12 });
  page.drawText(`Data: ${new Date(booking.date).toLocaleDateString('pt-BR')}`, { x: 50, y: 660, size: 12 });
  page.drawText(`Quantidade: ${booking.quantity}`, { x: 50, y: 640, size: 12 });
  page.drawText(`Total: R$ ${(booking.price * booking.quantity).toLocaleString('pt-BR')}`, { x: 50, y: 620, size: 12 });
  page.drawText('Cancelamento permitido até 48 horas antes do evento.', { x: 50, y: 600, size: 12 });

  // Save the PDF and return the data
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

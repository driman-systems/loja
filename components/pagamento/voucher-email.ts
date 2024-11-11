import nodemailer from 'nodemailer';

export async function sendVoucherEmail(clientEmail: string, pdfBytes: Buffer) {
  const transporter = nodemailer.createTransport({
    host: 'mail.driman.com.br',  
    port: 465,  
    secure: true, 
    auth: {
      user: 'no-reply@driman.com.br',  
      pass: '!J9h2FY4iD#z',
    },
  });

  const mailOptions = {
    from: 'no-reply@driman.com.br',
    to: clientEmail,
    subject: 'Seu Voucher',
    text: 'Aqui está o seu voucher para o evento!',
    attachments: [
      {
        filename: 'voucher.pdf',
        content: pdfBytes,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

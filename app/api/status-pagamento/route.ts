import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const token = process.env.MP_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    
    const transactionId = body.data?.id;
    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    // Obter detalhes do pagamento do Mercado Pago
    const paymentDetailsResponse = await fetch(`https://api.mercadopago.com/v1/payments/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!paymentDetailsResponse.ok) {
      console.error("Erro ao buscar detalhes do pagamento na API do Mercado Pago:", await paymentDetailsResponse.text());
      return NextResponse.json({ success: false, error: "Erro ao buscar detalhes do pagamento." }, { status: 500 });
    }

    const paymentDetails = await paymentDetailsResponse.json();

    // Atualizar o status do pagamento no banco de dados
    const status = paymentDetails.status;
    let userMessage;
    switch (status) {
      case 'approved':
        userMessage = "Pagamento aprovado com sucesso!";
        break;
      case 'pending':
        userMessage = "Pagamento pendente. Aguarde a confirmação.";
        break;
      case 'in_process':
        userMessage = "Pagamento em processamento. Verificaremos em breve.";
        break;
      case 'rejected':
        userMessage = "Pagamento rejeitado. Tente novamente ou utilize outro método.";
        break;
      default:
        userMessage = "Status de pagamento desconhecido. Entre em contato com o suporte.";
        break;
    }

    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail: paymentDetails.status_detail || null,
        transactionAmount: paymentDetails.transaction_amount,
        payerEmail: paymentDetails.payer?.email || null,
        dateApproved: paymentDetails.date_approved || null,
        paymentMethod: paymentDetails.payment_method_id || null,
        statusMessage: userMessage, // Armazena a mensagem de status
        lastUpdated: new Date(),    // Atualiza a data da última modificação (opcional)
      },
    });

    // Atualizar bookings associados se o pagamento for aprovado
    if (status === 'approved' && updatedPayment.bookingIds.length > 0) {
      const bookingIdsAsString = updatedPayment.bookingIds.map(id => id.toString());
        await prisma.booking.updateMany({
          where: { id: { in: bookingIdsAsString } },
          data: { status: 'Confirmado', paymentStatus: 'Aprovado' },
        });
    }

    return NextResponse.json({ success: true, status, message: userMessage });
  } catch (error: any) {
    console.error("Erro no webhook:", error);

    if (body?.data?.id) {
      await prisma.payment.update({
        where: { transactionId: body.data.id.toString() },
        data: { status: "Erro", errorDetails: error.message, lastUpdated: new Date() },
      });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

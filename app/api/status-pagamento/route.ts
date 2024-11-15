import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Ably from 'ably';

const token = process.env.MP_ACCESS_TOKEN;
const ablyApiKey = process.env.NEXT_PUBLIC_ABLY_API_KEY!;

// Inicializando o cliente Ably com configuração básica
const ably = new Ably.Realtime({ key: ablyApiKey });

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    console.log('Dados recebidos pelo webhook:', body);

    const transactionId = body.data?.id;
    if (!transactionId) {
      console.error("Erro: ID de transação ausente na notificação.");
      return NextResponse.json({ success: false, error: "ID de transação ausente." }, { status: 400 });
    }

    // Faz uma requisição para obter os detalhes completos do pagamento
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

    // Obtém o status e outros detalhes do pagamento
    const status = paymentDetails.status;
    const statusDetail = paymentDetails.status_detail || null;
    const transactionAmount = paymentDetails.transaction_amount;
    const payerEmail = paymentDetails.payer?.email || null;
    const dateApproved = paymentDetails.date_approved || null;
    const paymentMethod = paymentDetails.payment_method_id || null;

    // Atualiza o status do pagamento no banco de dados com os novos detalhes
    const updatedPayment = await prisma.payment.update({
      where: { transactionId: transactionId.toString() },
      data: {
        status,
        statusDetail,
        transactionAmount,
        payerEmail,
        dateApproved,
        paymentMethod,
      },
    });

    // Envia o evento de status específico para o frontend
    const channel = ably.channels.get('paymentStatus');
    let userMessage;

    switch (status) {
      case 'approved':
        userMessage = "Pagamento aprovado com sucesso!";
        if (updatedPayment.bookingIds.length > 0) {
          const bookingIds = updatedPayment.bookingIds;
          await prisma.booking.updateMany({
            where: { id: { in: bookingIds } },
            data: {
              status: 'Confirmado',
              paymentStatus: 'Aprovado',
            },
          });
        }
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

    // Publica o evento de atualização de status para o canal do Ably
    await channel.publish('paymentStatusUpdate', { transactionId, status, message: userMessage });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro no webhook:", error);

    if (body?.data?.id) {
      await prisma.payment.update({
        where: { transactionId: body.data.id.toString() },
        data: {
          status: "Erro",
          errorDetails: error.message,
        },
      });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

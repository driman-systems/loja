import { CardPayment } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CreditCardPaymentProps {
  totalAmount: number;
  sessionEmail: string;
  bookings: any[];
  clientId: string | null; // Incluído o clientId
  handleClearCart: () => void;
  traduzirErroPagamento: (mensagemErro: string) => string;
}

const CreditCardPayment: React.FC<CreditCardPaymentProps> = ({
  totalAmount,
  sessionEmail,
  bookings,
  clientId,
  handleClearCart,
  traduzirErroPagamento,
}) => {
  const router = useRouter();

  const handleSubmitCreditCard = async (formData: any) => {
    const {
      paymentMethodId,
      token,
      issuerId,
      installments,
      identificationType,
      identificationNumber,
    } = formData;

    const paymentData = {
      clientId, // Enviando o clientId para o backend
      transaction_amount: totalAmount,
      token: token,
      description: "Pagamento de produtos", // Ajuste a descrição conforme necessário
      installments: Number(installments),
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email: sessionEmail || "guest",
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      },
      bookings,
    };

    try {
      const paymentResponse = await fetch("/api/mercadoPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Limpa o carrinho e redireciona para a página de sucesso
        handleClearCart();
        router.push(`/sucesso/${paymentResult.payment.id}`);
      } else {
        // Traduz e exibe o erro retornado pelo backend
        const mensagemErro = traduzirErroPagamento(paymentResult.error);
        toast.error(mensagemErro, { position: "top-center" });
      }
    } catch (err) {
      // Trata erros inesperados na requisição
      toast.error("Ocorreu um erro inesperado. Tente novamente.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="mt-6">
      <CardPayment
        initialization={{ amount: Math.max(totalAmount, 5) }} // Garante um valor mínimo de 5 para evitar restrições
        onSubmit={handleSubmitCreditCard}
        customization={{
          visual: { theme: "" },
          paymentMethods: {
            minInstallments: 1,
            maxInstallments: 3,
            types: { included: ["credit_card", "debit_card"] },
          },
        }}
      />
    </div>
  );
};

export default CreditCardPayment;

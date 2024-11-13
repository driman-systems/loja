import { CardPayment } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CreditCardPaymentProps {
  totalAmount: number;
  sessionEmail: string;
  bookings: any[];
  handleClearCart: () => void;
  traduzirErroPagamento: (mensagemErro: string) => string;
}

const CreditCardPayment: React.FC<CreditCardPaymentProps> = ({
  totalAmount,
  sessionEmail,
  bookings,
  handleClearCart,
  traduzirErroPagamento,
}) => {
  const router = useRouter();

  const handleSubmitCreditCard = async (formData: any) => {
    // Dados do pagamento recebidos do componente CardPayment
    const {
      paymentMethodId,
      token,
      issuerId,
      installments,
      identificationType,
      identificationNumber,
    } = formData;

    const paymentData = {
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
        handleClearCart();
        router.push(`/sucesso/${paymentResult.payment.id}`);
      } else {
        toast.error(traduzirErroPagamento(paymentResult.error), {
          position: "top-center",
        });
      }
    } catch (err) {
      toast.error("Ocorreu um erro no pagamento.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="mt-6">
      <CardPayment
        initialization={{ amount: totalAmount }}
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

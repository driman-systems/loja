"use client";
import { useState, useEffect } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { useCart } from "@/components/produtos/carrinhoContext";
import { useSession } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentMethodSelector from "@/components/pagamento/PaymentMethodSelector";
import PixPayment from "@/components/pagamento/PixPayment";
import CreditCardPayment from "@/components/pagamento/CreditCardPayment";

const PaymentPage = () => {
  const { cart, dispatch } = useCart();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"credit_card" | "pix">("credit_card");
  const { data: session } = useSession();

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
      locale: "pt-BR",
    });
  }, []);

  // Obter o clientId da sessão, se disponível
  const clientId = session?.user?.id;

  const bookings = cart.map((item) => ({
    productId: item.productId,
    companyId: item.companyId,
    clientId: clientId || null,
    clientEmail: session?.user.email || "guest",
    date: item.date,
    time: item.time,
    quantity: item.quantity,
    price: item.price,
    status: "Pendente",
  }));

  const traduzirErroPagamento = (mensagemErro: string): string => {
    const erros: { [key: string]: string } = {
      "Invalid user identification number": "CPF do usuário inválido.",
      "Invalid payment_method_id": "Método de pagamento inválido.",
      "cc_rejected_insufficient_amount": "Saldo insuficiente no cartão.",
      "cc_rejected_high_risk": "Pagamento recusado por alto risco.",
      "cc_rejected_bad_filled_card_number": "Número do cartão preenchido incorretamente.",
    };

    return erros[mensagemErro] || "Ocorreu um erro no pagamento.";
  };

  const handleClearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
      <div className="max-w-2xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <ToastContainer
          limit={1}
          autoClose={3000}
          position="top-center"
        />

        <h2 className="text-xl mb-6">Escolha o método de pagamento</h2>

        <PaymentMethodSelector
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
        />

        {selectedPaymentMethod === "pix" && (
          <PixPayment
            clientId={clientId || null} // Passando o clientId para PixPayment
            totalAmount={totalAmount}
            sessionEmail={session?.user.email || "guest"}
            traduzirErroPagamento={traduzirErroPagamento}
            bookings={bookings}          />
        )}

        {selectedPaymentMethod === "credit_card" && (
          <CreditCardPayment
            clientId={clientId || null}
            totalAmount={totalAmount}
            sessionEmail={session?.user.email || "guest"}
            bookings={bookings}
            handleClearCart={handleClearCart}
            traduzirErroPagamento={traduzirErroPagamento}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

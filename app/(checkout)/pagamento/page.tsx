"use client";
import { useState, useEffect } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/produtos/carrinhoContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FiCreditCard } from "react-icons/fi";
import { FaPix } from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentPage = () => {
  const { cart, dispatch } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"credit_card" | "pix" | null>("credit_card");
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixLink, setPixLink] = useState<string | null>(null);
  const [cpf, setCpf] = useState<string>(""); // Estado para o CPF
  const [loading, setLoading] = useState<boolean>(false); // Estado de carregamento
  const { data: session } = useSession();
  const router = useRouter();

  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: "pt-BR" });
  }, []);

  const traduzirErroPix = (mensagemErro: string): string => {
    const erros: { [key: string]: string } = {
      "Invalid user identification number": "CPF do usuário inválido.",
      "Invalid payment_method_id": "Método de pagamento inválido.",
      "cc_rejected_insufficient_amount": "Saldo insuficiente no cartão.",
      "cc_rejected_high_risk": "Pagamento recusado por alto risco.",
      "cc_rejected_bad_filled_card_number": "Número do cartão preenchido incorretamente.",
    };

    return erros[mensagemErro] || "Ocorreu um erro no pagamento.";
  };

  const handleSubmit = async (method: "credit_card" | "pix") => {
    setLoading(true);
    const bookings = cart.map((item) => ({
      productId: item.productId,
      companyId: item.companyId,
      clientEmail: session?.user.email || "guest",
      date: item.date,
      time: item.time,
      quantity: item.quantity,
      price: item.price,
      status: "Pendente",
    }));

    const paymentData: any = {
      transaction_amount: totalAmount,
      payment_method_id: method,
      payer: {
        email: session?.user.email || "guest",
      },
      bookings,
    };

    // Somente incluir o CPF se o método de pagamento for Pix
    if (method === "pix" && cpf) {
      paymentData.payer.identification = { type: "CPF", number: cpf };
    }

    try {
      const paymentResponse = await fetch("/api/mercadoPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      console.log(paymentResult)

      if (paymentResult.success) {
        dispatch({ type: "CLEAR_CART" });

        if (method === "pix") {
          setPixQRCode(paymentResult.payment.pixQRCode);
          setPixLink(paymentResult.payment.pixLink);
          toast.success("QR Code gerado com sucesso!", { position: "top-center" });
        } else {
          // Para pagamento com cartão, redirecionar para a página de sucesso
          router.push(`/sucesso/${paymentResult.payment.id}`);
        }
      } else {
        setError(traduzirErroPix(paymentResult.error));
        toast.error(traduzirErroPix(paymentResult.error), { position: "top-center" });
      }
    } catch (err) {
      setError("Ocorreu um erro no pagamento.");
      toast.error("Ocorreu um erro no pagamento.", { position: "top-center" });
    } finally {
      setLoading(false); // Finalizar o carregamento
    }
  };

  const handlePixLinkCopy = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(pixLink || "").then(
          () => toast.success("Link copiado com sucesso!", { position: "top-center" }),
          () => toast.error("Falha ao copiar o link. Tente manualmente.", { position: "top-center" })
        );
      } else {
        throw new Error("Clipboard API não disponível");
      }
    } catch (error) {
      toast.error("Seu dispositivo não permite copiar automaticamente. Copie manualmente.", { position: "top-center" });
    }
  };

  const renderPixPayment = () => (
    <div className="mt-6">
      {pixQRCode && (
        <>
          <h3 className="text-xl mb-4">Pagamento via Pix</h3>
          <p className="mb-4">Escaneie o QR Code abaixo ou copie o link para pagamento:</p>
          <Image
            src={`data:image/png;base64,${pixQRCode}`}
            alt="QR Code Pix"
            width={224}
            height={224}
            className="mb-4 mx-auto"
            unoptimized={true}
          />
        </>
      )}
      {pixLink && (
        <div className="mb-4">
          <input
            type="text"
            value={pixLink}
            readOnly
            className="w-full p-2 rounded bg-gray-700 text-white"
            onClick={(e) => {
              const input = e.target as HTMLInputElement;
              input.select();
            }}
          />
          <button
            className="mt-2 bg-red-500 hover:bg-red-700 text-white p-2 rounded"
            onClick={handlePixLinkCopy}
          >
            Copiar Link
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
      <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <ToastContainer /> {/* Container para os Toasts */}

        <h2 className="text-xl mb-6">Escolha o método de pagamento</h2>

        {/* Cards para escolha de pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer ${
              selectedPaymentMethod === "credit_card" ? "border-red-500" : "border-gray-600"
            }`}
            onClick={() => setSelectedPaymentMethod("credit_card")}
          >
            <FiCreditCard className="text-2xl mb-2 mx-auto" />
            <h3 className="text-md text-center">Cartão de Crédito/Débito</h3>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer ${
              selectedPaymentMethod === "pix" ? "border-red-500" : "border-gray-600"
            }`}
            onClick={() => setSelectedPaymentMethod("pix")}
          >
            <FaPix className="text-2xl mb-2 mx-auto" />
            <h3 className="text-md text-center">Pix</h3>
          </div>
        </div>

        {/* Exibir o campo de CPF apenas se o Pix for selecionado */}
        {selectedPaymentMethod === "pix" && (
          <div className="mt-4 md:flex md:items-center md:space-x-4">
            <input
              type="number"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Digite seu CPF"
              className="w-full md:w-2/3 p-2 rounded bg-gray-700 text-white mb-4 md:mb-0"
            />
            {/* Botão para submeter o pagamento via Pix */}
            <button
              className={`w-full md:w-1/3 bg-red-500 hover:bg-red-700 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleSubmit("pix")}
              disabled={loading}
            >
              {loading ? 'Gerando QR Code...' : 'Gerar QR Code'}
            </button>
          </div>
        )}

        {selectedPaymentMethod === "credit_card" && (
          <div className="mt-6">
            <CardPayment
              initialization={{ amount: totalAmount }}
              onSubmit={() => handleSubmit("credit_card")}
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
        )}

        {selectedPaymentMethod === "pix" && renderPixPayment()}

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default PaymentPage;

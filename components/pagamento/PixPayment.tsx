import { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

interface PixPaymentProps {
  totalAmount: number;
  sessionEmail: string;
  handleClearCart: () => void;
  traduzirErroPagamento: (mensagemErro: string) => string;
  bookings: any[]; // Adicionado
}

const PixPayment: React.FC<PixPaymentProps> = ({
  totalAmount,
  sessionEmail,
  handleClearCart,
  traduzirErroPagamento,
  bookings, // Adicionado
}) => {
  const [cpf, setCpf] = useState<string>("");
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixLink, setPixLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmitPix = async () => {
    setLoading(true);
    const paymentData = {
      transaction_amount: totalAmount,
      payment_method_id: "pix",
      payer: {
        email: sessionEmail || "guest",
        identification: { type: "CPF", number: cpf },
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
        setPixQRCode(paymentResult.payment.pixQRCode);
        setPixLink(paymentResult.payment.pixLink);
        toast.success("QR Code gerado com sucesso!", { position: "top-center" });
      } else {
        setError(traduzirErroPagamento(paymentResult.error));
        toast.error(traduzirErroPagamento(paymentResult.error), {
          position: "top-center",
        });
      }
    } catch (err) {
      setError("Ocorreu um erro no pagamento.");
      toast.error("Ocorreu um erro no pagamento.", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handlePixLinkCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixLink || "").then(
        () =>
          toast.success("Link copiado com sucesso!", { position: "top-center" }),
        () =>
          toast.error("Falha ao copiar o link. Tente manualmente.", {
            position: "top-center",
          })
      );
    } else {
      toast.error(
        "Seu dispositivo não permite copiar automaticamente. Copie manualmente.",
        { position: "top-center" }
      );
    }
  };

  return (
    <div className="mt-4">
      <div className="md:flex md:items-center md:space-x-4">
        <input
          type="number"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Digite seu CPF"
          className="w-full md:w-2/3 p-2 rounded bg-gray-700 text-white mb-4 md:mb-0"
        />
        <button
          className={`w-full md:w-1/3 bg-red-500 hover:bg-red-700 text-white p-2 rounded ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmitPix}
          disabled={loading}
        >
          {loading ? "Gerando QR Code..." : "Gerar QR Code"}
        </button>
      </div>

      {pixQRCode && (
        <div className="mt-6">
          <h3 className="text-xl mb-4">Pagamento via Pix</h3>
          <p className="mb-4">
            Escaneie o QR Code abaixo ou copie o link para pagamento:
          </p>
          <Image
            src={`data:image/png;base64,${pixQRCode}`}
            alt="QR Code Pix"
            width={224}
            height={224}
            className="mb-4 mx-auto"
            unoptimized={true}
          />
        </div>
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

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default PixPayment;

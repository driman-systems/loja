import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";

interface PixPaymentProps {
  totalAmount: number;
  sessionEmail: string;
  handleClearCart: () => void;
  traduzirErroPagamento: (mensagemErro: string) => string;
  bookings: any[];
  clientId: string | null;
}

let socket: Socket;

const PixPayment: React.FC<PixPaymentProps> = ({
  totalAmount,
  sessionEmail,
  handleClearCart,
  traduzirErroPagamento,
  bookings,
  clientId,
}) => {
  const [cpf, setCpf] = useState<string>("");
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixLink, setPixLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingQRCode, setGeneratingQRCode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const router = useRouter();

  // Formata o tempo para exibição
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Conecta ao Socket.io no cliente
  useEffect(() => {
    socket = io({ path: "/api/socket" });

    socket.on("paymentConfirmed", ({ transactionId, status }) => {
      if (status === "approved") {
        toast.success("Pagamento confirmado!");
        handleClearCart();
        router.push(`/sucesso/${transactionId}`);
      } else {
        toast.error("Pagamento não aprovado.");
      }
    });

    return () => {
      socket.off("paymentConfirmed");
    };
  }, [router, handleClearCart]);

  // Gera o QR Code Pix
  const generatePixQRCode = useCallback(async () => {
    setLoading(true);
    setGeneratingQRCode(true); // Inicia a geração do QR Code
    setTimeLeft(120); // Tempo de expiração do QR Code

    const paymentData = {
      clientId,
      transaction_amount: totalAmount,
      payment_method_id: "pix",
      payer: {
        email: sessionEmail || "guest",
        identification: { type: "CPF", number: cpf },
      },
      bookings,
    };

    try {
      const response = await fetch("/api/mercadoPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        handleClearCart();
        setPixQRCode(result.payment.pixQRCode);
        setPixLink(result.payment.pixLink);
        toast.success("QR Code gerado com sucesso!", { position: "top-center" });
      } else {
        const errorMsg = traduzirErroPagamento(result.error);
        setError(errorMsg);
        toast.error(errorMsg, { position: "top-center" });
      }
    } catch (err) {
      setError("Erro ao gerar o pagamento.");
      toast.error("Erro ao gerar o pagamento.", { position: "top-center" });
    } finally {
      setLoading(false);
      setGeneratingQRCode(false);
    }
  }, [clientId, totalAmount, sessionEmail, cpf, bookings, handleClearCart, traduzirErroPagamento]);

  return (
    <div className="mt-4 text-center">
      {!pixQRCode && generatingQRCode ? (
        <div className="text-lg text-gray-500">Gerando um novo QR Code...</div>
      ) : (
        <div>
          {pixQRCode && (
            <div>
              <div className="text-2xl font-bold">{formatTime(timeLeft)}</div>
              <Image src={`data:image/png;base64,${pixQRCode}`} alt="QR Code Pix" width={224} height={224} />
              {pixLink && <button onClick={() => navigator.clipboard.writeText(pixLink)}>Copiar Link</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PixPayment;

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
  expirationDate?: string;
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

  // Função para formatar o tempo em MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Conectar ao Socket.io no cliente
  useEffect(() => {
    socket = io({ path: "/api/socket" });

    socket.on("paymentConfirmed", ({ transactionId }) => {
      toast.success("Pagamento confirmado!");
      handleClearCart();
      router.push(`/sucesso/${transactionId}`);
    });

    return () => {
      socket.off("paymentConfirmed");
    };
  }, [router, handleClearCart]);

  // Função para gerar o QR Code Pix, com useCallback para evitar recriação desnecessária
  const generatePixQRCode = useCallback(async () => {
    setLoading(true);
    setGeneratingQRCode(true); // Iniciar estado de geração
    setTimeLeft(120); // Resetar o contador para 2 minutos

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
      setGeneratingQRCode(false); // Concluir estado de geração
    }
  }, [clientId, totalAmount, sessionEmail, cpf, bookings, handleClearCart, traduzirErroPagamento]);

  // Regenera o QR Code quando o tempo acaba
  useEffect(() => {
    if (timeLeft === 0 && pixQRCode) {
      setPixQRCode(null);
      generatePixQRCode();
    }
  }, [timeLeft, pixQRCode, generatePixQRCode]);

  // Atualiza o contador quando o QR Code está disponível
  useEffect(() => {
    if (pixQRCode && timeLeft > 0 && !generatingQRCode) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pixQRCode, timeLeft, generatingQRCode]);

  const handlePixLinkCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixLink || "").then(
        () => toast.success("Link copiado com sucesso!", { position: "top-center" }),
        () => toast.error("Falha ao copiar o link. Tente manualmente.", { position: "top-center" })
      );
    } else {
      toast.error("Seu dispositivo não permite copiar automaticamente. Copie manualmente.", { position: "top-center" });
    }
  };

  return (
    <div className="mt-4 text-center">
      {!pixQRCode && generatingQRCode ? (
        <div className="text-lg text-gray-500">Gerando um novo QR Code...</div>
      ) : (
        <>
          {pixQRCode ? (
            <>
              <div className="flex justify-center items-center h-24 w-24 mx-auto rounded-full bg-gray-800 text-white text-2xl font-bold">
                {formatTime(timeLeft)}
              </div>

              <div className="mt-6">
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
              </div>

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
            </>
          ) : (
            <div className="mb-4">
              <input
                type="number"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="Digite seu CPF"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <button
                className={`w-full mt-2 bg-red-500 hover:bg-red-700 text-white p-2 rounded ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={generatePixQRCode}
                disabled={loading}
              >
                {loading ? "Gerando QR Code..." : "Gerar QR Code"}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default PixPayment;

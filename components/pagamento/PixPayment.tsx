import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const socket = io("/", { path: "/api/socket" }); // Configura o caminho do Socket.io

interface PixPaymentProps {
  totalAmount: number;
  sessionEmail: string;
  handleClearCart: () => void;
  traduzirErroPagamento: (mensagemErro: string) => string;
  bookings: any[];
  clientId: string | null;
  expirationDate?: string;
}

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

  // Formata o tempo para o formato MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Configura a conexão ao Socket.io para escutar o evento de confirmação de pagamento
  useEffect(() => {
    socket.on("paymentConfirmed", ({ transactionId }) => {
      toast.success("Pagamento confirmado!");
      handleClearCart();
      router.push(`/sucesso/${transactionId}`);
    });

    return () => {
      socket.off("paymentConfirmed");
    };
  }, [router, handleClearCart]);

  // Função para gerar o QR Code do Pix
  const generatePixQRCode = useCallback(async () => {
    setLoading(true);
    setGeneratingQRCode(true);
    setTimeLeft(120);

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
      setGeneratingQRCode(false);
    }
  }, [clientId, totalAmount, sessionEmail, cpf, bookings, handleClearCart, traduzirErroPagamento]);

  // Regenera o QR Code quando o tempo expira
  useEffect(() => {
    if (timeLeft === 0 && pixQRCode) {
      setPixQRCode(null);
      generatePixQRCode();
    }
  }, [timeLeft, pixQRCode, generatePixQRCode]);

  // Atualiza o contador enquanto o QR Code está disponível
  useEffect(() => {
    if (pixQRCode && timeLeft > 0 && !generatingQRCode) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pixQRCode, timeLeft, generatingQRCode]);

  // Função para copiar o link do Pix
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

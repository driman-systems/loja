"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import clipboard from "clipboard";
import { useCart } from "@/components/produtos/carrinhoContext"; // Caminho ajustado para o CartContext

interface PixPaymentProps {
  totalAmount: number;
  sessionEmail: string;
  traduzirErroPagamento: (mensagemErro: string) => string;
  bookings: any[];
  clientId: string | null;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  totalAmount,
  sessionEmail,
  traduzirErroPagamento,
  bookings,
  clientId,
}) => {
  const [cpf, setCpf] = useState<string>("");
  const [isCpfValid, setIsCpfValid] = useState<boolean>(true);
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [pixLink, setPixLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingQRCode, setGeneratingQRCode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Inicia como null, só começa quando o QR Code é gerado
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentApproved, setPaymentApproved] = useState<boolean>(false);

  const router = useRouter();
  const { dispatch } = useCart(); // Acessa o contexto do carrinho

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // Função para validar CPF
  const validateCpf = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let checkDigit1 = 11 - (sum % 11);
    if (checkDigit1 >= 10) checkDigit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    let checkDigit2 = 11 - (sum % 11);
    if (checkDigit2 >= 10) checkDigit2 = 0;

    return checkDigit1 === parseInt(cpf[9]) && checkDigit2 === parseInt(cpf[10]);
  };

  // Função para lidar com a entrada do CPF e aplicar a máscara
  const handleCpfChange = (value: string) => {
    const maskedCpf = value
      .replace(/\D/g, "") // Remove caracteres não numéricos
      .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona ponto após os primeiros 3 dígitos
      .replace(/(\d{3})(\d)/, "$1.$2") // Adiciona ponto após os próximos 3 dígitos
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Adiciona traço nos últimos 2 dígitos
    setCpf(maskedCpf);

    const rawCpf = maskedCpf.replace(/[^\d]/g, ""); // Remove a máscara para validar
    if (rawCpf.length === 11) {
      setIsCpfValid(validateCpf(rawCpf)); // Valida o CPF se tiver 11 dígitos
    } else {
      setIsCpfValid(true); // Reseta a validação para evitar erro prematuro
    }
  };

  const generatePixQRCode = useCallback(async () => {
    const rawCpf = cpf.replace(/[^\d]/g, ""); // Remove a máscara antes de enviar
    if (!rawCpf || rawCpf.length !== 11 || !isCpfValid) {
      setError("Por favor, insira um CPF válido.");
      return;
    }

    setLoading(true);
    setGeneratingQRCode(true);

    const paymentData = {
      clientId,
      transaction_amount: totalAmount,
      payment_method_id: "pix",
      payer: {
        email: sessionEmail || "guest",
        identification: { type: "CPF", number: rawCpf },
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
        setPixQRCode(paymentResult.payment.pixQRCode);
        setPixLink(paymentResult.payment.pixLink);
        setTransactionId(paymentResult.payment.id);
        setTimeLeft(240); // Inicia o contador apenas quando o QR Code é gerado
        toast.dismiss();
        toast.success("QR Code gerado com sucesso!", { position: "top-center" });
      } else {
        setError(traduzirErroPagamento(paymentResult.error));
        toast.dismiss();
        toast.error(traduzirErroPagamento(paymentResult.error), { position: "top-center" });
      }
    } catch (err) {
      setError("Ocorreu um erro no pagamento.");
      toast.dismiss();
      toast.error("Ocorreu um erro no pagamento.", { position: "top-center" });
    } finally {
      setLoading(false);
      setGeneratingQRCode(false);
    }
  }, [clientId, totalAmount, sessionEmail, cpf, bookings, isCpfValid, traduzirErroPagamento]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime ? prevTime - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && pixQRCode) {
      setPixQRCode(null); // Reseta o QR Code anterior
      generatePixQRCode(); // Gera um novo QR Code automaticamente
    }
  }, [timeLeft, pixQRCode, generatePixQRCode]);

  const handlePixLinkCopy = () => {
    if (pixLink) {
      try {
        clipboard.copy(pixLink);
        toast.dismiss();
        toast.success("Pix Copia e Cola copiado com sucesso!", { position: "top-center" });
      } catch (error) {
        console.error("Erro ao copiar o Pix Copia e Cola:", error);
        toast.dismiss();
        toast.error("Falha ao copiar o Pix Copia e Cola. Tente manualmente.", { position: "top-center" });
      }
    } else {
      toast.dismiss();
      toast.error("Pix Copia e Cola não disponível.", { position: "top-center" });
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
                {formatTime(timeLeft || 0)}
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
                  />
                  <button
                    onClick={handlePixLinkCopy}
                    className="mt-2 bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                  >
                    Pix copia e cola
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mb-4">
              <input
                type="text"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="Digite seu CPF"
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              {!isCpfValid && <p className="text-red-400 mt-2">CPF inválido.</p>}
              <button
                className={`w-full mt-2 bg-red-500 hover:bg-red-700 text-white p-2 rounded ${
                  loading || !cpf || cpf.replace(/[^\d]/g, "").length !== 11 || !isCpfValid
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                onClick={generatePixQRCode}
                disabled={loading || !cpf || cpf.replace(/[^\d]/g, "").length !== 11 || !isCpfValid}
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

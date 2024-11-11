"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Importando o ícone de spin

const SuccessPage = ({ params }: { params: { id: string } }) => {
  const [payment, setPayment] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado de carregamento
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const paymentResponse = await fetch(`/api/payments/${id}`);
        const paymentData = await paymentResponse.json();

        if (paymentResponse.ok) {
          setPayment(paymentData.payment);
          const bookingIds = paymentData.payment.bookingIds;
          const bookingResponses = await Promise.all(
            bookingIds.map(async (bookingId: string) => {
              const bookingResponse = await fetch(`/api/bookings/${bookingId}`);
              return bookingResponse.json();
            })
          );
          setBookings(bookingResponses.map((res) => res.booking));
        } else {
          throw new Error(paymentData.error || "Erro ao carregar dados do pagamento.");
        }
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      } finally {
        setLoading(false); // Finaliza o estado de carregamento
      }
    };

    fetchPaymentData();
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl text-center font-bold mb-6">Pagamento Concluído com Sucesso!</h1>

      {loading ? (
        // Mostra o ícone de carregamento enquanto os dados são buscados
        <div className="flex items-center space-x-2">
          <AiOutlineLoading3Quarters className="animate-spin text-3xl" />
          <p className="text-lg">Carregando dados do pagamento...</p>
        </div>
      ) : (
        <>
          {payment ? (
            <>
              <p className="text-lg mb-4">
                Total Pago: {payment.transactionAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              <h2 className="text-2xl font-bold mt-6 mb-4">Suas compras</h2>
              <ul className="list-inside">
                {bookings.map((booking) => (
                  <li key={booking.id} className="mb-4 py-6">
                    <div className="flex items-center">
                      {booking.company.logo && (
                        <Image
                          src={booking.company.logo}
                          alt={`Logo da empresa ${booking.company.name}`}
                          width={50}
                          height={50}
                          className="mr-4"
                        />
                      )}
                      <div>
                        <p className="font-bold">{booking.company.name}</p>
                        <p className="font-bold">{booking.product.title}</p>
                        <p><span className="font-bold">Data:</span> {new Date(booking.date).toLocaleDateString("pt-BR")}</p>
                        {booking.time && <p><span className="font-bold">Hora: </span> {booking.time}</p>}
                        <p><span className="font-bold">Quantidade:</span> {booking.quantity}</p>
                        <p><span className="font-bold">Valor:</span> R$ {(booking.price * booking.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/")}
                className="mt-12 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Meus cupons
              </button>
            </>
          ) : (
            <p>Erro ao carregar dados do pagamento.</p>
          )}
        </>
      )}
    </div>
  );
};

export default SuccessPage;

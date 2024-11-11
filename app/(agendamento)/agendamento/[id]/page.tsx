"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Oval } from "react-loader-spinner";
import { useCart } from "@/components/produtos/carrinhoContext";
import "react-calendar/dist/Calendar.css";
import "../../calendar.css"

const Calendar = dynamic(() => import("react-calendar"), { ssr: false });

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Product {
  id: string;
  title: string;
  price: number;
  promoPrice: number | null;
  hasDateReservation: boolean;
  image: string;
  reservationDays: number[];
  hasTimeReservation: boolean;
  reservationTimes: string[] | null;
  companyId: string; 
}

export default function AgendamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pricePerVoucher, setPricePerVoucher] = useState(0);
  const [reservationDays, setReservationDays] = useState<number[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { dispatch } = useCart();

  useEffect(() => {
    fetchProductData(productId);
  }, [productId]);

  const fetchProductData = async (productId: string) => {
    setIsLoading(true);
    const response = await fetch(`/api/products/?productId=${productId}`);
    if (response.ok) {
      const data: Product = await response.json();
      setProduct(data);
      setReservationDays(data.reservationDays);
      setPricePerVoucher(data.promoPrice || data.price);
      if (data.hasTimeReservation && data.reservationTimes) {
        setAvailableTimes(data.reservationTimes);
      }
    } else {
      alert("Erro ao buscar produto");
    }
    setIsLoading(false);
  };

  const handleDateChange = (value: Value) => {
    if (Array.isArray(value)) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(value);
    }
  };

  const handleSubmit = () => {
    if (!selectedDate || !product) return alert("Preencha todos os campos!");

    const agendamento = {
      cartItemId: `${product.id}-${Date.now()}`, 
      productId: product.id,
      productName: product.title,
      productImage: product.image,
      date: selectedDate,
      time: selectedTime,
      quantity,
      price: pricePerVoucher,
      companyId: product.companyId, 
    };

    // Adicionar o agendamento ao carrinho
    dispatch({ type: 'ADD_TO_CART', payload: agendamento });

    // Redirecionar para o carrinho
    router.push("/carrinho");
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const isDayDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();
    const isBeforeToday = date < today;

    return isBeforeToday || !reservationDays.includes(dayOfWeek);
  };

  if (isLoading) {
    return (
      <div className="flex items-center bg-gray-900 text-white justify-center min-h-screen">
        <Oval secondaryColor="#de2511" color="#fff" height={80} width={80} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center bg-gray-900 text-white justify-center min-h-screen">
        <Oval secondaryColor="#de2511" color="#fff" height={80} width={80} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Agende uma data</h1>

      <form className="w-full max-w-md space-y-6">
        {/* Seletor de Data */}
        <div className="flex flex-col items-center">
          <Calendar
            className="bg-gray-800 text-white p-2 rounded-lg shadow-md"
            onChange={handleDateChange}
            value={selectedDate}
            tileDisabled={isDayDisabled}
            calendarType="gregory"
          />
        </div>

        {/* Seletor de Horário (se aplicável) */}
        {product.hasTimeReservation && (
          <div>
            <label className="block text-sm font-medium mb-2">Selecione um horário:</label>
            <select
              value={selectedTime || ""}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
            >
              <option value="">Selecione um horário</option>
              {availableTimes.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantidade de Vouchers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={decrementQuantity}
              className="bg-gray-700 text-white px-4 py-3 rounded-md"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              readOnly
              className="w-20 text-center p-3 border border-gray-600 rounded-md bg-gray-700 text-white"
            />
            <button
              type="button"
              onClick={incrementQuantity}
              className="bg-gray-700 text-white px-4 py-3 rounded-md"
            >
              +
            </button>
          </div>

          {/* Exibir o valor total */}
          <div className="text-lg font-bold text-white">
            Total: R$ {(pricePerVoucher * quantity).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Botão de Enviar */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-red-500 text-white p-2 rounded-md font-bold hover:bg-red-600 transition duration-300"
        >
          Adicionar ao Carrinho
        </button>
      </form>
    </div>
  );
}

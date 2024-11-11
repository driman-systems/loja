"use client";

import { useCart } from '@/components/produtos/carrinhoContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTrashAlt } from 'react-icons/fa'; // Ícone de lixeira
import { useState } from 'react';

export default function CarrinhoPage() {
  const { cart, dispatch } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemoveItem = (cartItemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { cartItemId } });
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const incrementQuantity = (cartItemId: string) => {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item) {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { cartItemId, quantity: item.quantity + 1 } });
    }
  };

  const decrementQuantity = (cartItemId: string) => {
    const item = cart.find(item => item.cartItemId === cartItemId);
    if (item && item.quantity > 1) {
      dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { cartItemId, quantity: item.quantity - 1 } });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-900 text-white">
      <div className='flex flex-col w-full max-w-xl mx-auto'>
        <h1 className="text-2xl font-bold mb-6">Suas compras</h1>
        {cart.length > 0 ? (
          <>
            {cart.map((item, index) => (
              <div key={index} className="border-b border-gray-700 p-2">
                <h2 className="text-lg py-2 font-semibold">{item.productName}</h2>
                <div className="flex flex-row items-start sm:items-center space-x-4">
                  {/* Imagem do Produto */}
                  <div className="relative w-20 h-12">
                    <Image 
                      src={item.productImage || '/default-product-image.png'}
                      alt={item.productName}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-md"
                    />
                  </div>
                  
                  {/* Detalhes do Produto */}
                  <div className="flex-1">
                    <div className='py-2'>
                      <p>Data: {new Date(item.date).toLocaleDateString()}</p>
                      {item.time && <p>Horário: {item.time || "Sem horário"}</p>}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decrementQuantity(item.cartItemId)}
                        disabled={item.quantity <= 1}
                        className="bg-gray-700 text-white px-4 py-2 rounded-md"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => incrementQuantity(item.cartItemId)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-md"
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-2">Subtotal: R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                {/* Ícone de Lixeira */}
                <div className='flex w-full justify-end items-end py-2'>
                    <button
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="text-gray-400 hover:text-gray-700 transition self-end sm:self-center"
                    >
                        <FaTrashAlt size={20} />
                    </button>
                </div>
              </div>
            ))}

            {/* Subtotal */}
            <div className="mt-6 text-lg font-bold text-right">
              Total: R$ {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>

            {/* Botão de Checkout */}
            <button
              onClick={handleCheckout}
              className="bg-red-500 text-white w-full px-6 py-4 mt-6 rounded-md hover:bg-red-600 transition text-lg"
              disabled={isProcessing}
            >
              Finalizar Compra
            </button>
          </>
        ) : (
          <p className="text-gray-400">Seu carrinho está vazio.</p>
        )}
      </div>
    </div>
  );
}

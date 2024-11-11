"use client";

import { useEffect } from 'react';
import { FaTimes, FaTrashAlt } from 'react-icons/fa';
import { useCart } from './carrinhoContext'; // Importar o contexto do carrinho
import Image from 'next/image';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { cart, dispatch } = useCart(); // Pega os dados do carrinho

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleRemoveItem = (cartItemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { cartItemId } });
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-gray-800 w-full sm:w-80 h-full p-4 shadow-lg transition-transform transform translate-x-0 z-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Suas compras</h2>
          <button onClick={onClose} className="text-white">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="mt-4">
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index}>
              <p className="text-white py-2">{item.productName}</p>
              <div className="flex items-center space-x-4 mb-4">
                
                <Image
                  src={item.productImage || '/default-product-image.png'}
                  alt={item.productName || 'Imagem do produto'}
                  width={60}
                  height={60}
                  className="rounded-md"
                  style={{ objectFit: 'cover' }}
                />
                <div className="flex-1">
                  <p className="text-gray-400">Data: {new Date(item.date).toLocaleDateString()}</p>
                  <p className="text-gray-400">Quantidade: {item.quantity}</p>
                  <p className="text-gray-400">Total: R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }</p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.cartItemId)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <FaTrashAlt size={16} />
                </button>

              </div>
              </div>
            ))
          ) : (
            <p className="text-white py-20">Sem produtos no momento...</p>
          )}
        </div>

        {cart.length > 0 && (
          <button className="bg-red-500 text-white w-full py-2 mt-4 rounded-md hover:bg-red-600 transition">
            Finalizar Compra
          </button>
        )}
      </div>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>
    </div>
  );
};

export default CartModal;

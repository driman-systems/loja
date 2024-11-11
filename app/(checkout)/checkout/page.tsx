"use client"
import { useState } from "react";
import { useCart } from "@/components/produtos/carrinhoContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiTrash } from "react-icons/fi";

interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number; 
}

const CheckoutPage = () => {
  const { cart, dispatch } = useCart();
  const [coupon, setCoupon] = useState<string>("");
  const router = useRouter();

  const handleFinalize = () => {
    router.push("/pagamento");
  };

  const increaseQuantity = (item: CartItem) => {
    const newQuantity = item.quantity + 1;

    dispatch({
      type: "UPDATE_ITEM_QUANTITY",
      payload: {
        cartItemId: item.cartItemId,
        quantity: newQuantity,
      },
    });
  };

  const decreaseQuantity = (item: CartItem) => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;

      dispatch({
        type: "UPDATE_ITEM_QUANTITY",
        payload: {
          cartItemId: item.cartItemId,
          quantity: newQuantity,
        },
      });
    } else {
      removeItem(item.cartItemId); 
    }
  };

  const removeItem = (cartItemId: string) => {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: { cartItemId },
    });
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center px-4">
      <div className="max-w-xl w-full bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Seu Carrinho</h2>

        {cart.map((item: CartItem) => (
          <div key={item.cartItemId} className="mb-4 flex justify-between items-center">
            <div className="w-[50px]">
              <Image
                src={item.productImage || "/placeholder.png"}
                alt={item.productName}
                width={50}
                height={50}
                className="w-full h-auto object-cover rounded-md"
                style={{ aspectRatio: "1/1" }}
              />
            </div>
            <div className="flex-1 px-4">
              <h3>{item.productName}</h3>
              <p>Qtd: {item.quantity}</p>
              <div className="flex space-x-6 mt-2">
                <button onClick={() => decreaseQuantity(item)} className="bg-gray-600 px-2 rounded">-</button>
                <button onClick={() => increaseQuantity(item)} className="bg-gray-600 px-2 rounded">+</button>
                <button onClick={() => removeItem(item.cartItemId)} className="bg-red-600 px-2 rounded flex items-center">
                  <FiTrash className="text-white" />
                </button>
              </div>
            </div>
            <p className="font-bold">R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          </div>
        ))}

        <div className="justify-end text-end py-3">
          <p className="text-lg font-bold">Total: R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
            placeholder="Cupom de Desconto"
          />
          <button className="ml-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500">
            Aplicar
          </button>
        </div>

        <div className="mt-6 flex md:justify-end items-center text-center">
          <button
            onClick={handleFinalize}
            className="flex justify-center md:px-6 w-full md:w-auto bg-red-600 text-white py-4 md:py-2 rounded-md hover:bg-red-500"
          >
            Ir para pagameto - R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

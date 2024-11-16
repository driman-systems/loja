"use client";

import { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  cartItemId: string;
  productId: string;
  productName: string; 
  productImage: string | null; 
  date: Date;
  time: string | null;
  quantity: number;
  price: number;
  companyId: string; 
}

const initialCartState: CartItem[] = [];

const cartReducer = (state: CartItem[], action: any) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const updatedCart = [...state, { ...action.payload, price: action.payload.price }];
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;

    case 'REMOVE_FROM_CART':
      const filteredCart = state.filter(item => item.cartItemId !== action.payload.cartItemId);
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      return filteredCart;

    case 'UPDATE_ITEM_QUANTITY':
      const updatedQuantityCart = state.map(item => 
        item.cartItemId === action.payload.cartItemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedQuantityCart));
      return updatedQuantityCart;

    case 'LOAD_CART':
      return action.payload;

    case 'CLEAR_CART':
    localStorage.removeItem('cart');
    return [];

    default:
      return state;
  }
};

const CartContext = createContext<{
  cart: CartItem[];
  dispatch: React.Dispatch<any>;
} | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(storedCart) });
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

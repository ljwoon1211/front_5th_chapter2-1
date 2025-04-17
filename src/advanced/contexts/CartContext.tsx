import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Product } from '../types/index';
import initialProducts from '../data/products';

const initialState: AppState = {
  products: [],
  lastSelectedItem: null,
  bonusPoints: 0,
  totalAmount: 0,
  itemCount: 0,
};

export interface CartContextType {
  state: AppState;
  setState: (newState: Partial<AppState>) => void;
  initState: (products?: Product[]) => void;
  addToCart: (productId: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, setStateInternal] = useState<AppState>({ ...initialState });

  const setState = (newState: Partial<AppState>) => {
    setStateInternal((prevState) => {
      const updatedState = { ...prevState, ...newState };
      return updatedState;
    });
  };

  const initState = (products: Product[] = initialProducts) => {
    setStateInternal({
      ...initialState,
      products: JSON.parse(JSON.stringify(products)),
    });
  };

  // 장바구니에 상품 추가
  const addToCart = (productId: string) => {
    const productToAdd = state.products.find((p) => p.id === productId);

    if (!productToAdd) return;

    if (productToAdd.quantity <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    const updatedProducts = state.products.map((product) => {
      if (product.id === productId) {
        return { ...product, quantity: product.quantity - 1 };
      }
      return product;
    });

    setState({
      products: updatedProducts,
      lastSelectedItem: productId,
    });
  };

  useEffect(() => {
    initState();
  }, []);

  return (
    <CartContext.Provider
      value={{
        state,
        setState,
        initState,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

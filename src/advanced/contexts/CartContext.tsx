import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Product } from '../types';
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
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, change: number) => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, setStateInternal] = useState<AppState>({ ...initialState });

  // 디버깅을 위한 상태 변경 로깅
  useEffect(() => {
    console.log('상태 업데이트:', state);
  }, [state]);

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

  // 장바구니에서 상품 제거
  const removeFromCart = (productId: string) => {
    // 상품 수량 복구 로직을 포함해야 함
    // 실제 구현은 컴포넌트에서 처리
  };

  // 장바구니 상품 수량 변경
  const updateQuantity = (productId: string, change: number) => {
    // 수량 변경 로직
    // 실제 구현은 컴포넌트에서 처리
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
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

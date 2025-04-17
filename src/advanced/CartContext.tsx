import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Product } from './types';
import initialProducts from './data/product';

const initialState: AppState = {
  products: [],
  lastSelectedItem: null,
  bonusPoints: 0,
  totalAmount: 0,
  itemCount: 0,
};

interface CartContextType {
  state: AppState;
  setState: (newState: Partial<AppState>) => void;
  initState: (products?: Product[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, setStateInternal] = useState<AppState>({ ...initialState });

  const setState = (newState: Partial<AppState>) => {
    setStateInternal(prevState => ({ ...prevState, ...newState }));
  };

  const initState = (products: Product[] = initialProducts) => {
    setStateInternal({
      ...initialState,
      products: JSON.parse(JSON.stringify(products)),
    });
  };

  useEffect(() => {
    initState();
  }, []);

  const contextValue = {
    state,
    setState,
    initState
  };

  return (
    <CartContext.Provider value= { contextValue } >
    { children }
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
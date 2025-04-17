import React from 'react';
import { CartProvider } from '../contexts/CartContext';
import Cart from './Cart/index';

const AppComponent: React.FC = () => {
  return (
    <CartProvider>
      <div id="app">
        <Cart />
      </div>
    </CartProvider>
  );
};

export default AppComponent;

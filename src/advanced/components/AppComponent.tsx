import React from 'react';
import { CartProvider } from '../CartContext.tsx';
import { CartComponent } from './CartComponent';

const AppComponent: React.FC = () => {
  return (
    <CartProvider>
      <div id="app">
        <CartComponent />
      </div>
    </CartProvider>
  );
};

export default AppComponent;

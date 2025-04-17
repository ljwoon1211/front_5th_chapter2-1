import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../hooks/useCart';
import { usePromotion } from '../../hooks/usePromotion';
import { useCartCalculation } from '../../hooks/useCartCalculation';
import { CartItem as CartItemType, Product } from '../../types/index';

import CartItemList from './CartItemList';
import CartTotal from './CartTotal';
import ProductSelector from './ProductSelector';
import StockInfo from './StockInfo';

export const Cart: React.FC = () => {
  const { state, setState } = useCart();
  const { products } = state;

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // 장바구니 아이템 가격 업데이트 함수 - 중요!
  const updateCartItemPrices = useCallback((updatedProducts: Product[]) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        const updatedProduct = updatedProducts.find((p) => p.id === item.product.id);
        if (updatedProduct) {
          return {
            ...item,
            product: updatedProduct,
          };
        }
        return item;
      })
    );
  }, []);

  usePromotion(updateCartItemPrices);

  const { totalAmount, discountRate, bonusPoints, calculateCart } = useCartCalculation(cartItems);

  useEffect(() => {
    calculateCart();
  }, []);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const firstAvailableProduct = products.find((p) => p.quantity > 0);
      if (firstAvailableProduct) {
        setSelectedProductId(firstAvailableProduct.id);
      }
    }
  }, [products, selectedProductId]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleAddToCart = () => {
    const productToAdd = products.find((p) => p.id === selectedProductId);

    if (!productToAdd) return;

    if (productToAdd.quantity <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    const existingItemIndex = cartItems.findIndex((item) => item.product.id === productToAdd.id);

    let newCartItems: CartItemType[];

    if (existingItemIndex >= 0) {
      newCartItems = [...cartItems];
      newCartItems[existingItemIndex].quantity += 1;
    } else {
      newCartItems = [...cartItems, { product: productToAdd, quantity: 1 }];
    }

    setCartItems(newCartItems);

    const updatedProducts = products.map((product) => {
      if (product.id === productToAdd.id) {
        return { ...product, quantity: product.quantity - 1 };
      }
      return product;
    });

    setState({
      products: updatedProducts,
      lastSelectedItem: productToAdd.id,
    });
  };

  // 장바구니 아이템 수량 변경
  const handleQuantityChange = (productId: string, change: number) => {
    const itemIndex = cartItems.findIndex((item) => item.product.id === productId);
    if (itemIndex === -1) return;

    const item = cartItems[itemIndex];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    if (change > 0) {
      const product = products.find((product) => product.id === productId);
      if (!product || product.quantity < 1) {
        alert('재고가 부족합니다.');
        return;
      }
    }

    const newCartItems = [...cartItems];
    newCartItems[itemIndex].quantity = newQuantity;
    setCartItems(newCartItems);

    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return { ...product, quantity: product.quantity - change };
      }
      return product;
    });

    setState({
      products: updatedProducts,
    });
  };

  const handleRemoveItem = (productId: string) => {
    const itemIndex = cartItems.findIndex((item) => item.product.id === productId);
    if (itemIndex === -1) return;

    const item = cartItems[itemIndex];
    const removedQuantity = item.quantity;

    const newCartItems = cartItems.filter((item) => item.product.id !== productId);
    setCartItems(newCartItems);

    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return { ...product, quantity: product.quantity + removedQuantity };
      }
      return product;
    });

    setState({
      products: updatedProducts,
    });
  };

  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-4">장바구니</h1>

        {/* 장바구니 아이템 목록 (빈 메시지 없음) */}
        <CartItemList
          items={cartItems}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
        />

        {/* 총액 표시 (항상 포인트 표시) */}
        <CartTotal
          totalAmount={totalAmount}
          discountRate={discountRate}
          bonusPoints={bonusPoints}
        />

        {/* 상품 선택 및 추가 */}
        <ProductSelector
          products={products}
          selectedProductId={selectedProductId}
          onProductSelect={handleProductSelect}
          onAddToCart={handleAddToCart}
        />

        {/* 재고 정보 표시 */}
        <StockInfo products={products} />
      </div>
    </div>
  );
};

export default Cart;

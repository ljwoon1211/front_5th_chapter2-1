import React, { useState, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { usePromotion } from '../../hooks/usePromotion';
import { useCartCalculation } from '../../hooks/useCartCalculation';
import { CartItem as CartItemType, Product } from '../../types/index';

import CartItemList from './CartItemList.tsx';
import CartTotal from './CartTotal.tsx';
import ProductSelector from './ProductSelector.tsx';
import StockInfo from './StockInfo.tsx';

export const Cart: React.FC = () => {
  const { state, setState } = useCart();
  const { products } = state;

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // 프로모션 기능 훅 사용
  usePromotion();

  // 장바구니 계산 훅 사용
  const { totalAmount, discountRate, bonusPoints, getLowStockProducts } =
    useCartCalculation(cartItems);

  // 상품 목록이 변경되면 첫 번째 상품 선택
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const firstAvailableProduct = products.find((p) => p.quantity > 0);
      if (firstAvailableProduct) {
        setSelectedProductId(firstAvailableProduct.id);
      }
    }
  }, [products, selectedProductId]);

  // 장바구니 아이템 가격 업데이트
  const updateCartItemPrices = (updatedProducts: Product[]) => {
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
  };

  // 상품 선택 핸들러
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  // 장바구니에 상품 추가
  const handleAddToCart = () => {
    const productToAdd = products.find((p) => p.id === selectedProductId);

    if (!productToAdd) return;

    if (productToAdd.quantity <= 0) {
      alert('재고가 부족합니다.');
      return;
    }

    // 장바구니에 이미 있는지 확인
    const existingItemIndex = cartItems.findIndex((item) => item.product.id === productToAdd.id);

    let newCartItems: CartItemType[];

    if (existingItemIndex >= 0) {
      // 이미 있으면 수량 증가
      newCartItems = [...cartItems];
      newCartItems[existingItemIndex].quantity += 1;
    } else {
      // 없으면 새로 추가
      newCartItems = [...cartItems, { product: productToAdd, quantity: 1 }];
    }

    setCartItems(newCartItems);

    // 상품 재고 감소
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
      // 수량이 0 이하면 아이템 제거
      handleRemoveItem(productId);
      return;
    }

    // 수량 증가 시 재고 확인
    if (change > 0) {
      const product = products.find((p) => p.id === productId);
      if (!product || product.quantity < 1) {
        alert('재고가 부족합니다.');
        return;
      }
    }

    // 장바구니 아이템 수량 업데이트
    const newCartItems = [...cartItems];
    newCartItems[itemIndex].quantity = newQuantity;
    setCartItems(newCartItems);

    // 상품 재고 업데이트
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

  // 장바구니 아이템 제거
  const handleRemoveItem = (productId: string) => {
    const itemIndex = cartItems.findIndex((item) => item.product.id === productId);
    if (itemIndex === -1) return;

    const item = cartItems[itemIndex];
    const removedQuantity = item.quantity;

    // 장바구니에서 아이템 제거
    const newCartItems = cartItems.filter((item) => item.product.id !== productId);
    setCartItems(newCartItems);

    // 상품 재고 복구
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

        {/* 장바구니 아이템 목록 */}
        <CartItemList
          items={cartItems}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
        />

        {/* 총액 표시 */}
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

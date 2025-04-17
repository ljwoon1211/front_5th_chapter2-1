import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../CartContext';
import { calculateCartTotals } from '../utils/calculateCarts';
import { setupFlashSaleTimer, setupProductSuggestionTimer } from '../utils/promotion';
import { Product } from '../types';
import CONSTANTS from '../constants';

interface CartItem {
  product: Product;
  quantity: number;
}

export const CartComponent: React.FC = () => {
  const { state, setState } = useCart();
  const { products, lastSelectedItem } = state;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [bonusPoints, setBonusPoints] = useState<number>(0);

  // useRef를 사용하여 최신 상태 값을 유지
  const productsRef = useRef<Product[]>(products);
  const lastSelectedItemRef = useRef<string | null>(lastSelectedItem);

  // 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    lastSelectedItemRef.current = lastSelectedItem;
  }, [lastSelectedItem]);

  // 상품 목록이 변경되면 첫 번째 상품 선택
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const firstAvailableProduct = products.find((p) => p.quantity > 0);
      if (firstAvailableProduct) {
        setSelectedProductId(firstAvailableProduct.id);
      }
    }
    updateStockInfo();
  }, [products, selectedProductId]);

  // 장바구니 변경 시 계산 업데이트
  useEffect(() => {
    calculateCart();
  }, [cartItems, products]); // products 추가하여 가격 변경 시에도 업데이트

  // 최신 lastSelectedItem 반환하는 함수 생성
  const getLastSelectedItem = useCallback(() => {
    return lastSelectedItemRef.current;
  }, []);

  // 상품 업데이트 콜백 함수 생성 - 의존성 변화 방지
  const updateProductsCallback = useCallback(
    (updatedProducts: Product[]) => {
      console.log('상품 업데이트 콜백 실행', updatedProducts);
      setState({ products: updatedProducts });
      // 장바구니 아이템 가격도 업데이트
      updateCartItemPrices(updatedProducts);
    },
    [setState]
  );

  // 초기화 및 프로모션 타이머 설정
  useEffect(() => {
    console.log('프로모션 타이머 설정');

    // 타이머 정리 함수
    const flashSaleCleanup = setupFlashSaleTimer(
      productsRef.current,
      updateProductsCallback,
      setState
    );

    const productSuggestionCleanup = setupProductSuggestionTimer(
      productsRef.current,
      updateProductsCallback,
      getLastSelectedItem, // useCart()를 직접 호출하지 않고 함수 참조 전달
      setState
    );

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      console.log('프로모션 타이머 정리');
      flashSaleCleanup();
      productSuggestionCleanup();
    };
  }, [updateProductsCallback, setState, getLastSelectedItem]);

  // 재고 부족 상품 확인
  const getLowStockProducts = () => {
    return products.filter((product) => product.quantity < 5);
  };

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

  // 장바구니 계산
  const calculateCart = () => {
    if (cartItems.length === 0) {
      setTotalAmount(0);
      setDiscountRate(0);
      setBonusPoints(0);
      return;
    }

    let subTotal = 0;
    let itemCount = 0;
    let discountedTotal = 0;

    // 아이템별 수량, 가격 계산
    cartItems.forEach((item) => {
      const itemTotal = item.product.price * item.quantity;
      subTotal += itemTotal;
      itemCount += item.quantity;

      let itemDiscountRate = 0;
      if (item.quantity >= CONSTANTS.QUANTITY_DISCOUNT_THRESHOLD) {
        itemDiscountRate =
          CONSTANTS.PRODUCT_DISCOUNTS[
            item.product.id as keyof typeof CONSTANTS.PRODUCT_DISCOUNTS
          ] || 0;
      }

      discountedTotal += itemTotal * (1 - itemDiscountRate);
    });

    let finalDiscountRate = 0;

    if (itemCount >= CONSTANTS.BULK_DISCOUNT_THRESHOLD) {
      const bulkDiscount = subTotal * CONSTANTS.BULK_DISCOUNT_RATE;
      const itemDiscount = subTotal - discountedTotal;

      if (bulkDiscount > itemDiscount) {
        discountedTotal = subTotal * (1 - CONSTANTS.BULK_DISCOUNT_RATE);
        finalDiscountRate = CONSTANTS.BULK_DISCOUNT_RATE;
      } else {
        finalDiscountRate = (subTotal - discountedTotal) / subTotal || 0;
      }
    } else {
      finalDiscountRate = (subTotal - discountedTotal) / subTotal || 0;
    }

    // 화요일 할인 적용
    if (new Date().getDay() === 2) {
      discountedTotal *= 1 - CONSTANTS.TUESDAY_DISCOUNT_RATE;
      finalDiscountRate = Math.max(finalDiscountRate, CONSTANTS.TUESDAY_DISCOUNT_RATE);
    }

    const points = Math.floor(discountedTotal / 1000);

    setTotalAmount(discountedTotal);
    setDiscountRate(finalDiscountRate);
    setBonusPoints(points);

    setState({
      totalAmount: discountedTotal,
      bonusPoints: points,
      itemCount,
    });
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

    let newCartItems: CartItem[];

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

  // 재고 정보 업데이트
  const updateStockInfo = () => {
    // 필요시 재고 관련 상태 업데이트
  };

  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-4">장바구니</h1>

        {/* 장바구니 아이템 목록 */}
        <div id="cart-items">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              id={item.product.id}
              className="flex justify-between items-center mb-2"
            >
              <span>
                {item.product.name} - {item.product.price}원 x {item.quantity}
              </span>
              <div>
                <button
                  className="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1"
                  data-product-id={item.product.id}
                  data-change="-1"
                  onClick={() => handleQuantityChange(item.product.id, -1)}
                >
                  -
                </button>
                <button
                  className="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1"
                  data-product-id={item.product.id}
                  data-change="1"
                  onClick={() => handleQuantityChange(item.product.id, 1)}
                >
                  +
                </button>
                <button
                  className="remove-item bg-red-500 text-white px-2 py-1 rounded"
                  data-product-id={item.product.id}
                  onClick={() => handleRemoveItem(item.product.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 총액 표시 */}
        <div id="cart-total" className="text-xl font-bold my-4">
          총액: {Math.round(totalAmount)}원
          {discountRate > 0 && (
            <span className="text-green-500 ml-2">
              ({(discountRate * 100).toFixed(1)}% 할인 적용)
            </span>
          )}
          {bonusPoints > 0 && (
            <span id="loyalty-points" className="text-blue-500 ml-2">
              (포인트: {bonusPoints})
            </span>
          )}
        </div>

        {/* 상품 선택 및 추가 */}
        <div className="flex items-center">
          <select
            id="product-select"
            className="border rounded p-2 mr-2"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id} disabled={product.quantity === 0}>
                {product.name} - {product.price}원
              </option>
            ))}
          </select>

          <button
            id="add-to-cart"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAddToCart}
          >
            추가
          </button>
        </div>

        {/* 재고 정보 표시 */}
        <div id="stock-status" className="text-sm text-gray-500 mt-2">
          {getLowStockProducts().map((product) => (
            <div key={product.id}>
              {product.name}:{' '}
              {product.quantity > 0 ? `재고 부족 (${product.quantity}개 남음)` : '품절'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

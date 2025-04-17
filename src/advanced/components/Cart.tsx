import React, { useEffect, useRef, useCallback } from 'react';
import { useCart } from '../CartContext';
import { calculateCartTotals } from '../utils/calculateCarts';
import { setupFlashSaleTimer, setupProductSuggestionTimer } from '../utils/promotion';
import { Product } from '../types';

const Cart: React.FC = () => {
  const { state, setState } = useCart();
  const { products, lastSelectedItem, totalAmount, bonusPoints } = state;

  // 컴포넌트 참조 저장
  const cartItemsRef = useRef<HTMLDivElement>(null);
  const productSelectRef = useRef<HTMLSelectElement>(null);
  const stockInfoRef = useRef<HTMLDivElement>(null);
  const totalPriceRef = useRef<HTMLDivElement>(null);

  // 최신 상태를 유지하기 위한 ref
  const productsRef = useRef<Product[]>(products);
  const lastSelectedItemRef = useRef<string | null>(lastSelectedItem);

  // 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    lastSelectedItemRef.current = lastSelectedItem;
  }, [lastSelectedItem]);

  // 장바구니에 상품 추가
  const handleAddToCart = () => {
    const selectedProductId = productSelectRef.current?.value;
    if (!selectedProductId) return;

    const productToAdd = products.find((product) => product.id === selectedProductId);

    if (productToAdd && productToAdd.quantity > 0) {
      addItemToCart(productToAdd, 1);

      const updatedProducts = products.map((product) => {
        if (product.id === selectedProductId) {
          return { ...product, quantity: product.quantity - 1 };
        }
        return product;
      });

      setState({
        products: updatedProducts,
        lastSelectedItem: selectedProductId,
      });

      updateCartCalculations();
    } else if (productToAdd && productToAdd.quantity <= 0) {
      alert('재고가 부족합니다.');
    }
  };

  // 장바구니 항목 변경 처리
  const handleCartItemClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.classList.contains('quantity-change') || target.classList.contains('remove-item')) {
      const productId = target.getAttribute('data-product-id');
      if (!productId) return;

      const itemElement = document.getElementById(productId);
      if (!itemElement) return;

      // 상태에서 제품 찾기
      const productIndex = products.findIndex((product) => product.id === productId);
      if (productIndex === -1) return;

      const product = products[productIndex];
      const updatedProducts = [...products];

      if (target.classList.contains('quantity-change')) {
        const quantityChange = parseInt(target.getAttribute('data-change') || '0');
        const itemSpan = itemElement.querySelector('span');
        if (!itemSpan) return;

        const currentQuantityMatch = itemSpan.textContent?.match(/x\s*(\d+)$/);
        const currentQuantity = currentQuantityMatch ? parseInt(currentQuantityMatch[1], 10) : 0;
        const newQuantity = currentQuantity + quantityChange;

        if (
          newQuantity > 0 &&
          (quantityChange < 0 || newQuantity <= product.quantity + currentQuantity)
        ) {
          const textParts = itemSpan.textContent?.split('x ') || [];
          if (textParts.length > 0) {
            itemSpan.textContent = `${textParts[0]}x ${newQuantity}`;
          }

          updatedProducts[productIndex] = {
            ...product,
            quantity: product.quantity - quantityChange,
          };
        } else if (newQuantity <= 0) {
          itemElement.remove();

          updatedProducts[productIndex] = {
            ...product,
            quantity: product.quantity + currentQuantity,
          };
        } else {
          alert('재고가 부족합니다.');
          return;
        }
      } else if (target.classList.contains('remove-item')) {
        const itemSpan = itemElement.querySelector('span');
        if (!itemSpan) return;

        const currentQuantityMatch = itemSpan.textContent?.match(/x\s*(\d+)$/);
        const removedQuantity = currentQuantityMatch ? parseInt(currentQuantityMatch[1], 10) : 0;

        itemElement.remove();

        updatedProducts[productIndex] = {
          ...product,
          quantity: product.quantity + removedQuantity,
        };
      }

      setState({
        products: updatedProducts,
      });

      updateCartCalculations();
    }
  };

  // 장바구니에 항목 추가
  const addItemToCart = (product: Product, quantity = 1) => {
    if (!cartItemsRef.current) return;

    const existingItem = document.getElementById(product.id);

    if (existingItem) {
      const span = existingItem.querySelector('span');
      if (span) {
        const currentQuantityMatch = span.textContent?.match(/x\s*(\d+)$/);
        const currentQuantity = currentQuantityMatch ? parseInt(currentQuantityMatch[1], 10) : 0;
        const newQuantity = currentQuantity + quantity;
        const textParts = span.textContent?.split('x ') || [];
        if (textParts.length > 0) {
          span.textContent = `${textParts[0]}x ${newQuantity}`;
        }
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = product.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML = `
        <span>${product.name} - ${product.price}원 x ${quantity}</span>
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" 
            data-product-id="${product.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" 
            data-product-id="${product.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" 
            data-product-id="${product.id}">삭제</button>
        </div>
      `;
      cartItemsRef.current.appendChild(newItem);
    }
  };

  // 콜백 함수로 캐싱하여 재생성 방지
  const updateProductOptions = useCallback((updatedProducts: Product[]) => {
    console.log('상품 옵션 업데이트', updatedProducts);
    if (!productSelectRef.current) return;
    productSelectRef.current.innerHTML = '';

    updatedProducts.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} - ${product.price}원`;
      if (product.quantity === 0) option.disabled = true;
      productSelectRef.current?.appendChild(option);
    });
  }, []);

  // 최신 lastSelectedItem을 반환하는 함수 생성
  const getLastSelectedItem = useCallback(() => {
    return lastSelectedItemRef.current;
  }, []);

  // 장바구니 총액 표시 업데이트
  const updateTotalPrice = (totalAmount: number, discountRate: number) => {
    if (!totalPriceRef.current) return;

    // 기존 내용 초기화
    totalPriceRef.current.textContent = `총액: ${Math.round(totalAmount)}원`;

    if (discountRate > 0) {
      const span = document.createElement('span');
      span.className = 'text-green-500 ml-2';
      span.textContent = `(${(discountRate * 100).toFixed(1)}% 할인 적용)`;
      totalPriceRef.current.appendChild(span);
    }
  };

  // 보너스 포인트 표시
  const renderBonusPoints = (points: number) => {
    if (!totalPriceRef.current) return;

    let pointsTag = document.getElementById('loyalty-points');

    if (!pointsTag) {
      pointsTag = document.createElement('span');
      pointsTag.id = 'loyalty-points';
      pointsTag.className = 'text-blue-500 ml-2';
      totalPriceRef.current.appendChild(pointsTag);
    }

    pointsTag.textContent = `(포인트: ${points})`;
  };

  // 재고 정보 업데이트
  const updateStockInfoDisplay = (productsToDisplay: Product[]) => {
    if (!stockInfoRef.current) return;

    let infoMsg = '';

    productsToDisplay.forEach((product) => {
      if (product.quantity < 5) {
        infoMsg += `${product.name}: ${product.quantity > 0 ? `재고 부족 (${product.quantity}개 남음)` : '품절'}\n`;
      }
    });

    stockInfoRef.current.textContent = infoMsg;
  };

  const updateCartCalculations = () => {
    if (!cartItemsRef.current) return;

    const cartItems = cartItemsRef.current.children;
    const { totalAmount, bonusPoints, discountRate } = calculateCartTotals(cartItems, products);

    setState({
      totalAmount,
      bonusPoints,
    });

    updateTotalPrice(totalAmount, discountRate);
    renderBonusPoints(bonusPoints);
    updateStockInfoDisplay(products);
  };

  // 초기화 및 프로모션 타이머 설정
  useEffect(() => {
    console.log('초기화 및 타이머 설정');
    updateProductOptions(products);
    updateStockInfoDisplay(products);

    const cartItemsElement = cartItemsRef.current;
    if (cartItemsElement) {
      // 타입스크립트에서 Event 타입 호환을 위한 변환 함수
      const handleClick = (e: Event) => handleCartItemClick(e as unknown as MouseEvent);
      cartItemsElement.addEventListener('click', handleClick);
    }

    // 프로모션 타이머 설정 - 정리 함수 받기
    const flashSaleCleanup = setupFlashSaleTimer(
      productsRef.current,
      updateProductOptions,
      setState
    );

    const productSuggestionCleanup = setupProductSuggestionTimer(
      productsRef.current,
      updateProductOptions,
      getLastSelectedItem, // useCart()를 직접 호출하지 않는 함수로 변경
      setState
    );

    // 정리 함수
    return () => {
      console.log('타이머 정리');
      if (cartItemsElement) {
        // 타입스크립트에서 Event 타입 호환을 위한 변환 함수
        const handleClick = (e: Event) => handleCartItemClick(e as unknown as MouseEvent);
        cartItemsElement.removeEventListener('click', handleClick);
      }

      // 타이머 정리
      flashSaleCleanup();
      productSuggestionCleanup();
    };
  }, [updateProductOptions, getLastSelectedItem, products, setState]);

  // state 변경시 UI 업데이트
  useEffect(() => {
    updateStockInfoDisplay(products);
    updateTotalPrice(totalAmount, 0);
    renderBonusPoints(bonusPoints);
  }, [products, totalAmount, bonusPoints]);

  return (
    <div className="bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-2xl font-bold mb-4">장바구니</h1>

        <div ref={cartItemsRef} id="cart-items"></div>

        <div ref={totalPriceRef} id="cart-total" className="text-xl font-bold my-4">
          총액: 0원
        </div>

        <div className="flex items-center">
          <select
            ref={productSelectRef}
            id="product-select"
            className="border rounded p-2 mr-2"
          ></select>

          <button
            id="add-to-cart"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAddToCart}
          >
            추가
          </button>
        </div>

        <div ref={stockInfoRef} id="stock-status" className="text-sm text-gray-500 mt-2"></div>
      </div>
    </div>
  );
};

export default Cart;

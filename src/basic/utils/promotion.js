import CONSTANTS from '../config/constants.js';
import { calculateCart, updateCartItemPrices } from './calculateCarts.js';
import { getState, setState } from './state';

/**
 * 번개세일 타이머 설정
 */
export const setupFlashSaleTimer = (updateUI) => {
  // 번개 세일 로직
  const intervalCallback = () => {
    const state = getState();
    const luckyItemIndex = Math.floor(Math.random() * state.products.length);
    const luckyItem = state.products[luckyItemIndex];

    if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem.quantity > 0) {
      const updatedProducts = [...state.products];
      updatedProducts[luckyItemIndex] = {
        ...luckyItem,
        price: Math.round(luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE)),
      };

      alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');

      setState({
        products: updatedProducts,
      });

      updateCartItemPrices(updatedProducts);

      if (window.ui) {
        calculateCart(window.ui);
        updateUI(updatedProducts);
      }
    }
  };

  setTimeout(() => {
    setInterval(intervalCallback, CONSTANTS.FLASH_SALE_INTERVAL);
  }, Math.random() * CONSTANTS.FLASH_SALE_INITIAL_DELAY);
};

/**
 * 상품 추천 타이머 설정
 */
export const setupProductSuggestionTimer = (updateUI, getLastSelectedItem) => {
  setTimeout(() => {
    setInterval(() => {
      const state = getState();
      const lastSelectedItem = getLastSelectedItem();

      if (lastSelectedItem) {
        // 재고가 있는 첫번째 상품만 계속 할인됨
        // const suggestIndex = state.products.findIndex(
        //   (item) => item.id !== lastSelectedItem && item.quantity > 0
        // );

        // 마지막으로 선택한 상품이 아니면서 재고가 있는 상품들 필터링
        const availableProducts = state.products.filter(
          (item) => item.id !== lastSelectedItem && item.quantity > 0
        );

        if (availableProducts.length > 0) {
          // 랜덤으로 상품 선택
          const randomIndex = Math.floor(Math.random() * availableProducts.length);
          const suggest = availableProducts[randomIndex];

          // 원래 상품 배열에서의 인덱스 찾기
          const originalIndex = state.products.findIndex((item) => item.id === suggest.id);

          const updatedProducts = [...state.products];
          updatedProducts[originalIndex] = {
            ...suggest,
            price: Math.round(suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE)),
          };
          alert(suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');

          setState({
            products: updatedProducts,
          });

          updateCartItemPrices(updatedProducts);

          if (window.ui) {
            calculateCart(window.ui);
            updateUI(updatedProducts);
          }
        }
      }
    }, CONSTANTS.SUGGESTION_INTERVAL);
  }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);
};

import CONSTANTS from '../constants';
import { Product } from '../types';
import { AppState } from '../types';

/**
 * 번개세일 타이머 설정
 */
export const setupFlashSaleTimer = (
  products: Product[],
  updateUI: (products: Product[]) => void,
  setState: (newState: Partial<AppState>) => void
): () => void => {
  // 번개 세일 로직
  const intervalCallback = () => {
    try {
      const currentProducts = [...products];
      const luckyItemIndex = Math.floor(Math.random() * currentProducts.length);
      const luckyItem = currentProducts[luckyItemIndex];

      if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem?.quantity > 0) {
        const updatedProducts = [...currentProducts];

        const discountedPrice = Math.round(luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE));

        updatedProducts[luckyItemIndex] = {
          ...luckyItem,
          price: discountedPrice
        };

        alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);

        setState({
          products: updatedProducts
        });

        updateUI(updatedProducts);
      }
    } catch (error) {
      console.error("번개세일 처리 중 오류:", error);
    }
  };

  let initialTimeoutId: number | null = null;
  let intervalId: number | null = null;

  initialTimeoutId = window.setTimeout(() => {
    intervalId = window.setInterval(intervalCallback, CONSTANTS.FLASH_SALE_INTERVAL);
    intervalCallback();
  }, Math.random() * CONSTANTS.FLASH_SALE_INITIAL_DELAY);

  // 정리 함수 반환
  return () => {
    if (initialTimeoutId !== null) {
      window.clearTimeout(initialTimeoutId);
    }
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }
  };
};

/**
 * 상품 추천 타이머 설정
 */
export const setupProductSuggestionTimer = (
  products: Product[],
  updateUI: (products: Product[]) => void,
  lastSelectedItemGetter: () => string | null, // 함수로 전달받음
  setState: (newState: Partial<AppState>) => void
): () => void => {
  let initialTimeoutId: number | null = null;
  let intervalId: number | null = null;

  initialTimeoutId = window.setTimeout(() => {
    intervalId = window.setInterval(() => {
      try {
        const currentProducts = [...products];
        const lastSelectedItem = lastSelectedItemGetter();

        if (lastSelectedItem) {
          // 마지막으로 선택한 상품이 아니면서 재고가 있는 상품들 필터링
          const availableProducts = currentProducts.filter(
            item => item.id !== lastSelectedItem && item.quantity > 0
          );

          if (availableProducts.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableProducts.length);
            const suggest = availableProducts[randomIndex];

            const originalIndex = currentProducts.findIndex(item => item.id === suggest.id);

            const updatedProducts = [...currentProducts];

            const discountedPrice = Math.round(suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE));

            updatedProducts[originalIndex] = {
              ...suggest,
              price: discountedPrice
            };

            alert(`${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);

            setState({
              products: updatedProducts
            });

            updateUI(updatedProducts);
          }
        }
      } catch (error) {
        console.error("상품 추천 처리 중 오류:", error);
      }
    }, CONSTANTS.SUGGESTION_INTERVAL);

    try {
      const lastSelectedItem = lastSelectedItemGetter();
    } catch (e) {
      console.error('첫 상품 추천 시도 중 오류:', e);
    }
  }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);

  return () => {
    if (initialTimeoutId !== null) {
      window.clearTimeout(initialTimeoutId);
    }
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }
  };
};
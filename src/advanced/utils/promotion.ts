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
      console.log('번개세일 타이머 실행 중...', products);

      // 현재 상품 배열에서 작업
      const currentProducts = [...products];
      const luckyItemIndex = Math.floor(Math.random() * currentProducts.length);
      const luckyItem = currentProducts[luckyItemIndex];

      if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem?.quantity > 0) {
        // 복사본 만들어서 수정
        const updatedProducts = [...currentProducts];

        // 할인된 가격 계산
        const discountedPrice = Math.round(luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE));

        updatedProducts[luckyItemIndex] = {
          ...luckyItem,
          price: discountedPrice
        };

        // 먼저 알림을 표시
        alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);

        // 상태 업데이트
        setState({
          products: updatedProducts
        });

        // UI 업데이트
        updateUI(updatedProducts);
      }
    } catch (error) {
      console.error("번개세일 처리 중 오류:", error);
    }
  };

  // 타이머 ID를 저장할 변수들
  let initialTimeoutId: number | null = null;
  let intervalId: number | null = null;

  // 타이머 설정
  initialTimeoutId = window.setTimeout(() => {
    intervalId = window.setInterval(intervalCallback, CONSTANTS.FLASH_SALE_INTERVAL);
    // 첫 번째 간격 후에도 바로 실행해볼 수 있도록 함
    intervalCallback();
  }, Math.random() * CONSTANTS.FLASH_SALE_INITIAL_DELAY + 1000); // 최소 1초 후에 시작

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
        console.log('상품 추천 타이머 실행 중...', products);

        // 현재 상품 배열과 선택된 아이템으로 작업
        const currentProducts = [...products];
        // 함수를 호출해서 최신 lastSelectedItem 가져오기
        const lastSelectedItem = lastSelectedItemGetter();

        if (lastSelectedItem) {
          // 마지막으로 선택한 상품이 아니면서 재고가 있는 상품들 필터링
          const availableProducts = currentProducts.filter(
            item => item.id !== lastSelectedItem && item.quantity > 0
          );

          if (availableProducts.length > 0) {
            // 랜덤으로 상품 선택
            const randomIndex = Math.floor(Math.random() * availableProducts.length);
            const suggest = availableProducts[randomIndex];

            // 원래 상품 배열에서의 인덱스 찾기
            const originalIndex = currentProducts.findIndex(item => item.id === suggest.id);

            // 복사본 만들어서 수정
            const updatedProducts = [...currentProducts];

            // 할인된 가격 계산
            const discountedPrice = Math.round(suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE));

            updatedProducts[originalIndex] = {
              ...suggest,
              price: discountedPrice
            };

            // 먼저 알림을 표시
            alert(`${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);

            // 상태 업데이트
            setState({
              products: updatedProducts
            });

            // UI 업데이트
            updateUI(updatedProducts);
          }
        }
      } catch (error) {
        console.error("상품 추천 처리 중 오류:", error);
      }
    }, CONSTANTS.SUGGESTION_INTERVAL);

    // 첫 실행 시도
    try {
      const lastSelectedItem = lastSelectedItemGetter();
      console.log('첫 상품 추천 시도...', lastSelectedItem);
    } catch (e) {
      console.error('첫 상품 추천 시도 중 오류:', e);
    }
  }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY); // 최소 2초 후에 시작

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
import { useEffect, useRef, useCallback } from 'react';
import { Product } from '../types';
import CONSTANTS from '../constants';
import { useCart } from './useCart';

/**
 * 프로모션 기능을 관리하는 커스텀 훅
 * @param updateCartItemPrices 장바구니 아이템 가격 업데이트 함수
 */
export const usePromotion = (updateCartItemPrices: (updatedProducts: Product[]) => void) => {
  const { state, setState } = useCart();
  const { products, lastSelectedItem } = state;

  const productsRef = useRef<Product[]>(products);
  const lastSelectedItemRef = useRef<string | null>(lastSelectedItem);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    lastSelectedItemRef.current = lastSelectedItem;
  }, [lastSelectedItem]);

  const getLastSelectedItem = useCallback(() => {
    return lastSelectedItemRef.current;
  }, []);

  const updateProducts = useCallback(
    (updatedProducts: Product[]) => {
      setState({ products: updatedProducts });

      updateCartItemPrices(updatedProducts);
    },
    [setState, updateCartItemPrices]
  );

  const setupFlashSaleTimer = useCallback(() => {
    let timeoutId: number | null = null;
    let intervalId: number | null = null;

    const flashSaleCallback = () => {
      try {
        const currentProducts = [...productsRef.current];
        const luckyItemIndex = Math.floor(Math.random() * currentProducts.length);
        const luckyItem = currentProducts[luckyItemIndex];

        if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem?.quantity > 0) {
          const updatedProducts = [...currentProducts];

          const discountedPrice = Math.round(
            luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE)
          );

          updatedProducts[luckyItemIndex] = {
            ...luckyItem,
            price: discountedPrice,
          };

          // 알림 표시
          alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);

          updateProducts(updatedProducts);
        }
      } catch (error) {
        console.error('번개세일 처리 중 오류:', error);
      }
    };

    timeoutId = window.setTimeout(
      () => {
        intervalId = window.setInterval(flashSaleCallback, CONSTANTS.FLASH_SALE_INTERVAL);
        flashSaleCallback();
      },
      Math.random() * CONSTANTS.FLASH_SALE_INITIAL_DELAY + 1000
    );

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [updateProducts]);

  // 상품 추천 타이머 설정
  const setupProductSuggestionTimer = useCallback(() => {
    let timeoutId: number | null = null;
    let intervalId: number | null = null;

    const suggestionCallback = () => {
      try {
        const currentProducts = [...productsRef.current];
        const lastSelectedItem = getLastSelectedItem();

        if (lastSelectedItem) {
          // 마지막으로 선택한 상품이 아니면서 재고가 있는 상품들 필터링
          const availableProducts = currentProducts.filter(
            (item) => item.id !== lastSelectedItem && item.quantity > 0
          );

          if (availableProducts.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableProducts.length);
            const suggest = availableProducts[randomIndex];

            const originalIndex = currentProducts.findIndex((item) => item.id === suggest.id);

            const updatedProducts = [...currentProducts];

            const discountedPrice = Math.round(
              suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE)
            );

            updatedProducts[originalIndex] = {
              ...suggest,
              price: discountedPrice,
            };

            alert(`${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);

            updateProducts(updatedProducts);
          }
        }
      } catch (error) {
        console.error('상품 추천 처리 중 오류:', error);
      }
    };

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(suggestionCallback, CONSTANTS.SUGGESTION_INTERVAL);

      try {
        const lastItem = getLastSelectedItem();
      } catch (e) {
        console.error('첫 상품 추천 시도 중 오류:', e);
      }
    }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [getLastSelectedItem, updateProducts]);

  useEffect(() => {
    const flashSaleCleanup = setupFlashSaleTimer();
    const productSuggestionCleanup = setupProductSuggestionTimer();

    return () => {
      flashSaleCleanup();
      productSuggestionCleanup();
    };
  }, [setupFlashSaleTimer, setupProductSuggestionTimer]);

  return {
    // 필요한 경우 외부로 노출할 함수나 상태
  };
};

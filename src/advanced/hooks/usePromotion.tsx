import { useEffect, useRef, useCallback } from 'react';
import { Product } from '../types';
import CONSTANTS from '../constants';
import { useCart } from './useCart';

export const usePromotion = () => {
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
      console.log('상품 업데이트:', updatedProducts);
      setState({ products: updatedProducts });
    },
    [setState]
  );

  // 번개 세일 타이머 설정
  const setupFlashSaleTimer = useCallback(() => {
    let timeoutId: number | null = null;
    let intervalId: number | null = null;

    const flashSaleCallback = () => {
      try {
        console.log('번개세일 타이머 실행 중...', productsRef.current);

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

          alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);

          updateProducts(updatedProducts);
        }
      } catch (error) {
        console.error('번개세일 처리 중 오류:', error);
      }
    };

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(flashSaleCallback, CONSTANTS.FLASH_SALE_INTERVAL);
      flashSaleCallback();
    }, Math.random() * CONSTANTS.FLASH_SALE_INITIAL_DELAY);

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
        console.log('상품 추천 타이머 실행 중...', productsRef.current);

        // 현재 상품 배열과 선택된 아이템으로 작업
        const currentProducts = [...productsRef.current];
        const lastSelectedItem = getLastSelectedItem();

        if (lastSelectedItem) {
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
        console.log('첫 상품 추천 시도...', lastItem);
      } catch (e) {
        console.error('첫 상품 추천 시도 중 오류:', e);
      }
    }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);

    // 정리 함수 반환
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
    console.log('프로모션 타이머 설정');

    const flashSaleCleanup = setupFlashSaleTimer();
    const productSuggestionCleanup = setupProductSuggestionTimer();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      console.log('프로모션 타이머 정리');
      flashSaleCleanup();
      productSuggestionCleanup();
    };
  }, [setupFlashSaleTimer, setupProductSuggestionTimer]);

  return {
    // 필요한 경우 외부로 노출할 함수나 상태
  };
};

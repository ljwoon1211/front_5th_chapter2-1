import CONSTANTS from '../constants.ts';
import { Product } from '../types.ts';

/**
 * 번개세일 타이머 설정
 */
export const setupFlashSaleTimer = (
  products: Product[],
  updateUI: (products: Product[]) => void,
  setState: (newState: { products: Product[] }) => void
): void => {
  // 번개 세일 로직
  const intervalCallback = () => {
    const luckyItemIndex = Math.floor(Math.random() * products.length);
    const luckyItem = products[luckyItemIndex];

    if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem?.quantity > 0) {
      const updatedProducts = [...products];
      updatedProducts[luckyItemIndex] = {
        ...luckyItem,
        price: Math.round(luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE)),
      };

      alert(`번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);

      setState({ products: updatedProducts });
      updateUI(updatedProducts);
    }
  };

  // 타이머 설정
  setTimeout(() => {
    setInterval(intervalCallback, CONSTANTS.FLASH_SALE_INTERVAL);
  }, Math.random() * CONSTANTS.FLASH_SALE_INITIAL_DELAY);
};

/**
 * 상품 추천 타이머 설정
 */
export const setupProductSuggestionTimer = (
  products: Product[],
  updateUI: (products: Product[]) => void,
  getLastSelectedItem: () => string | null,
  setState: (newState: { products: Product[] }) => void
): void => {
  setTimeout(() => {
    setInterval(() => {
      const lastSelectedItem = getLastSelectedItem();

      if (lastSelectedItem) {
        const suggestIndex = products.findIndex(
          (item) => item.id !== lastSelectedItem && item.quantity > 0
        );

        if (suggestIndex !== -1) {
          const suggest = products[suggestIndex];
          alert(`${suggest.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`);

          const updatedProducts = [...products];
          updatedProducts[suggestIndex] = {
            ...suggest,
            price: Math.round(suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE)),
          };

          setState({ products: updatedProducts });
          updateUI(updatedProducts);
        }
      }
    }, CONSTANTS.SUGGESTION_INTERVAL);
  }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);
};
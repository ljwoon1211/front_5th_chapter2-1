import CONSTANTS from '../config/constants.js';

/**
 * 번개세일 타이머 설정
 */
export const setupFlashSaleTimer = (products, updateUI) => {
  // 번개 세일 로직
  const intervalCallback = () => {
    const luckyItem = products[Math.floor(Math.random() * products.length)];
    if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem.quantity > 0) {
      luckyItem.price = Math.round(luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE));
      alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
      updateUI(products);
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
export const setupProductSuggestionTimer = (products, updateUI, getLastSelectedItem) => {
  setTimeout(() => {
    setInterval(() => {
      const lastSelectedItem = getLastSelectedItem();

      if (lastSelectedItem) {
        const suggest = products.find((item) => item.id !== lastSelectedItem && item.quantity > 0);
        if (suggest) {
          alert(suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.price = Math.round(suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE));
          updateUI(products);
        }
      }
    }, CONSTANTS.SUGGESTION_INTERVAL);
  }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);
};

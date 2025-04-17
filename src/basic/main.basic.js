import createUI from './components/createUI';
import CONSTANTS from './config/constants';
import initialProducts from './data/products';

// 전역 상태 변수들
let products;
let lastSelectedItem,
  bonusPoints = 0,
  totalAmount = 0,
  itemCount = 0;

// UI 모듈 전역 선언
let ui;

const initApp = () => {
  // 상품 데이터 초기화
  products = JSON.parse(JSON.stringify(initialProducts));

  // UI 모듈 초기화
  ui = createUI();
  ui.initialize();

  // 상품 목록 렌더링
  ui.updateProductOptions(products);

  // 이벤트 리스너 설정
  ui.setupEventListeners(handleAddToCart, handleClickCartButton);

  // 초기 장바구니 상태 표시
  initializeCart();

  // 타이머 설정
  setupFlashSaleTimer();
  setupProductSuggestionTimer();
};

/**
 * 초기 장바구니 상태 설정
 */
const initializeCart = () => {
  // 초기 상태 설정
  totalAmount = 0;
  itemCount = 0;
  bonusPoints = 0;

  // UI 업데이트
  ui.updateTotalPrice(totalAmount, 0);
  ui.renderBonusPoints(bonusPoints);
  ui.updateStockInfoDisplay(products);
};

/**
 * 번개세일 타이머 설정
 */
const setupFlashSaleTimer = () => {
  // 번개 세일 로직
  const intervalCallback = () => {
    const luckyItem = products[Math.floor(Math.random() * products.length)];
    if (Math.random() < CONSTANTS.FLASH_SALE_CHANCE && luckyItem.quantity > 0) {
      luckyItem.price = Math.round(luckyItem.price * (1 - CONSTANTS.FLASH_SALE_DISCOUNT_RATE));
      alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
      ui.updateProductOptions(products);
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
const setupProductSuggestionTimer = () => {
  setTimeout(() => {
    setInterval(() => {
      if (lastSelectedItem) {
        const suggest = products.find((item) => item.id !== lastSelectedItem && item.quantity > 0);
        if (suggest) {
          alert(suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.price = Math.round(suggest.price * (1 - CONSTANTS.SUGGESTED_PRODUCT_DISCOUNT_RATE));
          ui.updateProductOptions(products);
        }
      }
    }, CONSTANTS.SUGGESTION_INTERVAL);
  }, Math.random() * CONSTANTS.SUGGESTION_INITIAL_DELAY);
};

/**
 * 장바구니 계산
 */
const calculateCart = () => {
  totalAmount = 0;
  itemCount = 0;
  let subTotal = 0;

  const cartItems = ui.getCartItems();

  // for문으로 아이템별 수량, 가격 계산
  for (let i = 0; i < cartItems.length; i++) {
    const result = processCartItem(cartItems[i], subTotal);
    subTotal = result.subTotal;
  }

  let discountRate = 0;

  // 아이템 수량 별 할인율
  if (itemCount >= CONSTANTS.BULK_DISCOUNT_THRESHOLD) {
    const bulkDiscount = totalAmount * CONSTANTS.BULK_DISCOUNT_RATE;
    const itemDiscount = subTotal - totalAmount;

    if (bulkDiscount > itemDiscount) {
      totalAmount = subTotal * (1 - CONSTANTS.BULK_DISCOUNT_RATE);
      discountRate = CONSTANTS.BULK_DISCOUNT_RATE;
    } else {
      discountRate = (subTotal - totalAmount) / subTotal;
    }
  } else {
    discountRate = (subTotal - totalAmount) / subTotal;
  }

  if (new Date().getDay() === 2) {
    totalAmount *= 1 - CONSTANTS.TUESDAY_DISCOUNT_RATE;
    discountRate = Math.max(discountRate, CONSTANTS.TUESDAY_DISCOUNT_RATE);
  }

  // UI 업데이트
  ui.updateTotalPrice(totalAmount, discountRate);

  // 포인트 계산 및 표시
  bonusPoints = Math.floor(totalAmount / 1000);
  ui.renderBonusPoints(bonusPoints);

  // 재고 정보 업데이트
  ui.updateStockInfoDisplay(products);
};

/**
 * for문으로 아이템별 수량, 가격 계산
 * @param {HTMLElement} cartItem - 처리할 장바구니 아이템 요소
 * @param {number} currentSubTotal - 현재까지의 소계
 * @returns {Object} 업데이트된 소계를 포함한 객체
 */
const processCartItem = (cartItem, currentSubTotal) => {
  let subTotal = currentSubTotal;
  const currentProduct = products.find((p) => p.id === cartItem.id);

  const itemQuantity = parseInt(cartItem.querySelector('span').textContent.split('x ')[1]);
  const itemTotal = currentProduct.price * itemQuantity;
  let discountRate = 0;

  itemCount += itemQuantity;
  subTotal += itemTotal;

  if (itemQuantity >= CONSTANTS.QUANTITY_DISCOUNT_THRESHOLD) {
    discountRate = CONSTANTS.PRODUCT_DISCOUNTS[currentProduct.id] || 0;
  }

  totalAmount += itemTotal * (1 - discountRate);

  return { subTotal };
};

/**
 * 장바구니에 상품 추가 처리
 */
const handleAddToCart = () => {
  const selectedProductId = ui.getSelectedProductId();
  const productToAdd = products.find((p) => p.id === selectedProductId);

  if (productToAdd && productToAdd.quantity > 0) {
    ui.addItemToCart(productToAdd, 1);
    productToAdd.quantity--;

    calculateCart();
    lastSelectedItem = selectedProductId;
  } else if (productToAdd && productToAdd.quantity <= 0) {
    alert('재고가 부족합니다.');
  }
};

/**
 * 장바구니 항목 변경 처리 (수량 증감, 삭제)
 */
const handleClickCartButton = (event) => {
  const targetElement = event.target;

  if (targetElement.classList.contains('quantity-change') || targetElement.classList.contains('remove-item')) {
    const productId = targetElement.dataset.productId;
    const itemElement = document.getElementById(productId);
    const product = products.find((p) => p.id === productId);

    if (targetElement.classList.contains('quantity-change')) {
      const quantityChange = parseInt(targetElement.dataset.change);
      const currentQuantity = parseInt(itemElement.querySelector('span').textContent.split('x ')[1]);
      const newQuantity = currentQuantity + quantityChange;

      if (newQuantity > 0 && (quantityChange < 0 || newQuantity <= product.quantity + currentQuantity)) {
        itemElement.querySelector('span').textContent =
          itemElement.querySelector('span').textContent.split('x ')[0] + 'x ' + newQuantity;
        product.quantity -= quantityChange;
      } else if (newQuantity <= 0) {
        itemElement.remove();
        product.quantity -= quantityChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (targetElement.classList.contains('remove-item')) {
      const removedQuantity = parseInt(itemElement.querySelector('span').textContent.split('x ')[1]);
      product.quantity += removedQuantity;
      itemElement.remove();
    }
    calculateCart();
  }
};

initApp();

import CONSTANTS from '../config/constants.js';
import { getState, setState } from './state.js';

export const calculateCart = (ui) => {
  let totalAmount = 0;
  let itemCount = 0;
  let subTotal = 0;

  const state = getState();
  const cartItems = ui.getCartItems();

  // for문으로 아이템별 수량, 가격 계산
  for (let i = 0; i < cartItems.length; i++) {
    const result = processCartItem(cartItems[i], subTotal, state.products);
    subTotal = result.subTotal;
    itemCount += result.addedCount;
    totalAmount += result.addedAmount;
  }

  let discountRate = 0;

  // 총 수량이 할인 기준치 이상인 경우 대량 할인 적용 고려
  if (itemCount >= CONSTANTS.BULK_DISCOUNT_THRESHOLD) {
    const bulkDiscount = totalAmount * CONSTANTS.BULK_DISCOUNT_RATE;
    const itemDiscount = subTotal - totalAmount;

    // 더 큰 할인을 적용
    if (bulkDiscount > itemDiscount) {
      totalAmount = subTotal * (1 - CONSTANTS.BULK_DISCOUNT_RATE);
      discountRate = CONSTANTS.BULK_DISCOUNT_RATE;
    } else {
      discountRate = (subTotal - totalAmount) / subTotal || 0;
    }
  } else {
    // 소량 구매 시 개별 상품 할인만 적용
    discountRate = (subTotal - totalAmount) / subTotal || 0;
  }

  // 화요일 할인 적용
  if (new Date().getDay() === 2) {
    totalAmount *= 1 - CONSTANTS.TUESDAY_DISCOUNT_RATE;
    discountRate = Math.max(discountRate, CONSTANTS.TUESDAY_DISCOUNT_RATE);
  }

  const bonusPoints = Math.floor(totalAmount / 1000);

  setState({
    ...state,
    totalAmount,
    itemCount,
    bonusPoints,
  });

  ui.updateTotalPrice(totalAmount, discountRate);
  ui.renderBonusPoints(bonusPoints);
  ui.updateStockInfoDisplay(state.products);
};

/**
 * 장바구니 아이템 처리 함수
 */
const processCartItem = (cartItem, currentSubTotal, products) => {
  let subTotal = currentSubTotal;
  const currentProduct = products.find((p) => p.id === cartItem.id);

  if (!currentProduct) {
    console.error('Product not found:', cartItem.id);
    return { subTotal, addedCount: 0, addedAmount: 0 };
  }

  // 아이템 텍스트에서 수량 추출
  const itemText = cartItem.querySelector('span').textContent;
  const itemQuantity = parseInt(itemText.split('x ')[1]);

  // 아이템 가격 추출 - 현재 상품의 실시간 가격 사용
  const itemPrice = currentProduct.price;
  const itemTotal = itemPrice * itemQuantity;

  subTotal += itemTotal;
  let discountRate = 0;

  // 수량 할인 적용
  if (itemQuantity >= CONSTANTS.QUANTITY_DISCOUNT_THRESHOLD) {
    discountRate = CONSTANTS.PRODUCT_DISCOUNTS[currentProduct.id] || 0;
  }

  const addedAmount = itemTotal * (1 - discountRate);

  return {
    subTotal,
    addedCount: itemQuantity,
    addedAmount,
  };
};

/**
 * 장바구니 아이템의 가격을 현재 상품 가격으로 업데이트
 */
export const updateCartItemPrices = (products) => {
  const cartItems = document.getElementById('cart-items').children;

  // 각 장바구니 아이템을 순회
  for (let i = 0; i < cartItems.length; i++) {
    const cartItem = cartItems[i];
    const productId = cartItem.id;

    // 해당 상품 찾기
    const product = products.find((p) => p.id === productId);
    if (!product) continue;

    // 현재 장바구니에 표시된 텍스트 가져오기
    const itemTextContent = cartItem.querySelector('span').textContent;

    // 수량 부분 추출 (예: "상품1 - 8000원 x 3"에서 "3" 부분)
    const quantityMatch = itemTextContent.match(/x\s*(\d+)$/);
    if (!quantityMatch) continue;

    const quantity = parseInt(quantityMatch[1]);

    // 새로운 가격으로 텍스트 업데이트
    cartItem.querySelector('span').textContent =
      `${product.name} - ${product.price}원 x ${quantity}`;
  }
};

/**
 * 초기 장바구니 상태 설정
 */
export const initializeCart = (ui) => {
  const state = getState();

  setState({
    ...state,
    totalAmount: 0,
    itemCount: 0,
    bonusPoints: 0,
  });

  ui.updateTotalPrice(0, 0);
  ui.renderBonusPoints(0);
  ui.updateStockInfoDisplay(state.products);
};

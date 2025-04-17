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

  // 화요일 할인 적용
  if (new Date().getDay() === 2) {
    totalAmount *= 1 - CONSTANTS.TUESDAY_DISCOUNT_RATE;
    discountRate = Math.max(discountRate, CONSTANTS.TUESDAY_DISCOUNT_RATE);
  }

  const bonusPoints = Math.floor(totalAmount / 1000);

  setState({
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

  const itemQuantity = parseInt(cartItem.querySelector('span').textContent.split('x ')[1]);
  const itemTotal = currentProduct.price * itemQuantity;
  let discountRate = 0;

  subTotal += itemTotal;

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
 * 초기 장바구니 상태 설정
 */
export const initializeCart = (ui) => {
  setState({
    totalAmount: 0,
    itemCount: 0,
    bonusPoints: 0,
  });

  const state = getState();

  ui.updateTotalPrice(0, 0);
  ui.renderBonusPoints(0);
  ui.updateStockInfoDisplay(state.products);
};

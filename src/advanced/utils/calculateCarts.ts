import CONSTANTS from '../constants';
import { Product } from '../types';

interface ProcessCartItemResult {
  subTotal: number;
  addedCount: number;
  addedAmount: number;
}

interface CartItem extends HTMLElement {
  id: string;
  querySelector: (selector: string) => HTMLElement;
}

export const processCartItem = (
  cartItem: CartItem,
  currentSubTotal: number,
  products: Product[]
): ProcessCartItemResult => {
  let subTotal = currentSubTotal;
  const currentProduct = products.find((p) => p.id === cartItem.id);

  if (!currentProduct) {
    return { subTotal, addedCount: 0, addedAmount: 0 };
  }

  const itemText = cartItem.querySelector('span')?.textContent || '';
  const quantityMatch = itemText.match(/x\s*(\d+)$/);
  const itemQuantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 0;

  const itemTotal = currentProduct.price * itemQuantity;
  let discountRate = 0;

  subTotal += itemTotal;

  if (itemQuantity >= CONSTANTS.QUANTITY_DISCOUNT_THRESHOLD) {
    discountRate = CONSTANTS.PRODUCT_DISCOUNTS[currentProduct.id as keyof typeof CONSTANTS.PRODUCT_DISCOUNTS] || 0;
  }

  const addedAmount = itemTotal * (1 - discountRate);

  return {
    subTotal,
    addedCount: itemQuantity,
    addedAmount,
  };
};

export const calculateCartTotals = (
  cartItems: HTMLCollectionOf<Element> | NodeListOf<Element> | CartItem[],
  products: Product[]
): {
  totalAmount: number;
  itemCount: number;
  bonusPoints: number;
  discountRate: number;
} => {
  let totalAmount = 0;
  let itemCount = 0;
  let subTotal = 0;

  // 아이템별 수량, 가격 계산
  for (let i = 0; i < cartItems.length; i++) {
    const result = processCartItem(cartItems[i] as CartItem, subTotal, products);
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
      discountRate = (subTotal - totalAmount) / subTotal || 0;
    }
  } else {
    discountRate = (subTotal - totalAmount) / subTotal || 0;
  }

  // 화요일 할인 적용
  if (new Date().getDay() === 2) {
    totalAmount *= 1 - CONSTANTS.TUESDAY_DISCOUNT_RATE;
    discountRate = Math.max(discountRate, CONSTANTS.TUESDAY_DISCOUNT_RATE);
  }

  const bonusPoints = Math.floor(totalAmount / 1000);

  return {
    totalAmount,
    itemCount,
    bonusPoints,
    discountRate,
  };
};
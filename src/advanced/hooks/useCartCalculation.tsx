import { useState, useEffect } from 'react';
import { useCart } from './useCart';
import { CartItem } from '../types/index';
import CONSTANTS from '../constants';

/**
 * 장바구니 계산 관련 로직을 관리하는 커스텀 훅
 */
export const useCartCalculation = (cartItems: CartItem[]) => {
  const { state, setState } = useCart();
  const { products } = state;

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [bonusPoints, setBonusPoints] = useState<number>(0);

  /**
   * 장바구니 계산 함수
   * */
  const calculateCart = () => {
    if (cartItems.length === 0) {
      setTotalAmount(0);
      setDiscountRate(0);
      setBonusPoints(0);
      return;
    }

    let subTotal = 0;
    let itemCount = 0;
    let discountedTotal = 0;

    // 아이템별 수량, 가격 계산
    cartItems.forEach((item) => {
      const itemTotal = item.product.price * item.quantity;
      subTotal += itemTotal;
      itemCount += item.quantity;

      let itemDiscountRate = 0;
      if (item.quantity >= CONSTANTS.QUANTITY_DISCOUNT_THRESHOLD) {
        itemDiscountRate =
          CONSTANTS.PRODUCT_DISCOUNTS[
            item.product.id as keyof typeof CONSTANTS.PRODUCT_DISCOUNTS
          ] || 0;
      }

      discountedTotal += itemTotal * (1 - itemDiscountRate);
    });

    let finalDiscountRate = 0;

    // 대량 구매 할인 적용 로직
    if (itemCount >= CONSTANTS.BULK_DISCOUNT_THRESHOLD) {
      const bulkDiscount = subTotal * CONSTANTS.BULK_DISCOUNT_RATE;
      const itemDiscount = subTotal - discountedTotal;

      if (bulkDiscount > itemDiscount) {
        discountedTotal = subTotal * (1 - CONSTANTS.BULK_DISCOUNT_RATE);
        finalDiscountRate = CONSTANTS.BULK_DISCOUNT_RATE;
      } else {
        finalDiscountRate = (subTotal - discountedTotal) / subTotal || 0;
      }
    } else {
      finalDiscountRate = (subTotal - discountedTotal) / subTotal || 0;
    }

    // 화요일 할인 적용
    if (new Date().getDay() === 2) {
      discountedTotal *= 1 - CONSTANTS.TUESDAY_DISCOUNT_RATE;
      finalDiscountRate = Math.max(finalDiscountRate, CONSTANTS.TUESDAY_DISCOUNT_RATE);
    }

    const points = Math.floor(discountedTotal / 1000);

    setTotalAmount(discountedTotal);
    setDiscountRate(finalDiscountRate);
    setBonusPoints(points);

    setState({
      totalAmount: discountedTotal,
      bonusPoints: points,
      itemCount,
    });
  };

  // 장바구니 아이템 가격 업데이트
  const updateCartItemPrices = (updatedProducts: typeof products) => {
    // 장바구니 아이템 가격 업데이트 로직 구현
    // 이 로직은 해당 컴포넌트에서 구현해야 함
  };

  const getLowStockProducts = () => {
    return products.filter((product) => product.quantity < 5);
  };

  useEffect(() => {
    calculateCart();
  }, [cartItems, products]);

  return {
    totalAmount,
    discountRate,
    bonusPoints,
    getLowStockProducts,
    calculateCart,
  };
};

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppState {
  products: Product[];
  lastSelectedItem: string | null;
  bonusPoints: number;
  totalAmount: number;
  itemCount: number;
}

export const CONSTANTS = {
  BULK_DISCOUNT_THRESHOLD: 30,
  BULK_DISCOUNT_RATE: 0.25,
  TUESDAY_DISCOUNT_RATE: 0.1,
  FLASH_SALE_DISCOUNT_RATE: 0.2,
  SUGGESTED_PRODUCT_DISCOUNT_RATE: 0.05,
  FLASH_SALE_CHANCE: 0.3,
  FLASH_SALE_INTERVAL: 30000,
  FLASH_SALE_INITIAL_DELAY: 10000,
  SUGGESTION_INTERVAL: 60000,
  SUGGESTION_INITIAL_DELAY: 20000,
  PRODUCT_DISCOUNTS: {
    p1: 0.1, // 상품1 할인율
    p2: 0.15, // 상품2 할인율
    p3: 0.2, // 상품3 할인율
    p4: 0.05, // 상품4 할인율
    p5: 0.25, // 상품5 할인율
  },
  QUANTITY_DISCOUNT_THRESHOLD: 10,
};
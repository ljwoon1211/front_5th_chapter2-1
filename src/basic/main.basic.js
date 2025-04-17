import createUI from './components/createUI';
import CONSTANTS from './config/constants';
import initialProducts from './data/products';
import { setupFlashSaleTimer, setupProductSuggestionTimer } from './utils/promotion';

// 전역 상태 변수들
let products;
let lastSelectedItem,
  bonusPoints = 0,
  totalAmount = 0,
  itemCount = 0;

// UI 모듈 전역 선언
let ui;

const initApp = () => {
  products = initialProducts;

  ui = createUI();
  ui.initialize();
  ui.updateProductOptions(products);

  ui.setupEventListeners(handleAddToCart, handleClickCartButton);

  // 초기 장바구니 상태 표시
  initializeCart();

  setupFlashSaleTimer(products, ui.updateProductOptions);
  setupProductSuggestionTimer(products, ui.updateProductOptions, () => lastSelectedItem);
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

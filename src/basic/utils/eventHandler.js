import { getState, setState } from './state';
import { calculateCart } from './calculateCarts';

/**
 * 장바구니에 상품 추가 처리
 * @param {Object} ui - UI 객체
 */
export const handleAddToCart = (ui) => {
  const state = getState();
  const selectedProductId = ui.getSelectedProductId();
  const productToAdd = state.products.find((product) => product.id === selectedProductId);

  if (productToAdd && productToAdd.quantity > 0) {
    ui.addItemToCart(productToAdd, 1);

    // 상품 수량 업데이트
    const updatedProducts = state.products.map((product) => {
      if (product.id === selectedProductId) {
        return { ...product, quantity: product.quantity - 1 };
      }
      return product;
    });

    setState({
      ...state,
      products: updatedProducts,
      lastSelectedItem: selectedProductId,
    });

    calculateCart(ui);
  } else if (productToAdd && productToAdd.quantity <= 0) {
    alert('재고가 부족합니다.');
  }
};

/**
 * 장바구니 항목 변경 처리 (수량 증감, 삭제)
 * @param {Event} event - 이벤트 객체
 * @param {Object} ui - UI 객체
 */
export const handleClickCartButton = (event, ui) => {
  const targetElement = event.target;

  if (targetElement.classList.contains('quantity-change') || targetElement.classList.contains('remove-item')) {
    const state = getState();
    const productId = targetElement.dataset.productId;
    const itemElement = document.getElementById(productId);

    // 상태에서 제품 찾기
    const productIndex = state.products.findIndex((product) => product.id === productId);
    if (productIndex === -1) return;

    const product = state.products[productIndex];
    const updatedProducts = [...state.products];

    if (targetElement.classList.contains('quantity-change')) {
      const quantityChange = parseInt(targetElement.dataset.change);
      const currentQuantity = parseInt(itemElement.querySelector('span').textContent.split('x ')[1]);
      const newQuantity = currentQuantity + quantityChange;

      if (newQuantity > 0 && (quantityChange < 0 || newQuantity <= product.quantity + currentQuantity)) {
        // 장바구니 항목 수량 업데이트
        itemElement.querySelector('span').textContent =
          itemElement.querySelector('span').textContent.split('x ')[0] + 'x ' + newQuantity;

        // 상품 재고 업데이트 (불변성 유지)
        updatedProducts[productIndex] = {
          ...product,
          quantity: product.quantity - quantityChange,
        };
      } else if (newQuantity <= 0) {
        // 장바구니에서 항목 제거
        itemElement.remove();

        // 상품 재고 업데이트 (불변성 유지)
        updatedProducts[productIndex] = {
          ...product,
          quantity: product.quantity + currentQuantity,
        };
      } else {
        alert('재고가 부족합니다.');
        return; // 변경 실패 시 함수 종료
      }
    } else if (targetElement.classList.contains('remove-item')) {
      const removedQuantity = parseInt(itemElement.querySelector('span').textContent.split('x ')[1]);

      // 장바구니에서 항목 제거
      itemElement.remove();

      // 상품 재고 업데이트 (불변성 유지)
      updatedProducts[productIndex] = {
        ...product,
        quantity: product.quantity + removedQuantity,
      };
    }

    // 상태 업데이트
    setState({
      ...state,
      products: updatedProducts,
    });

    // 장바구니 계산
    calculateCart(ui);
  }
};

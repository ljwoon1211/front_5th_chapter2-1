/**
 * 장바구니에 상품 추가 처리
 */
export const handleAddToCart = (products, ui, calculateCart, lastSelectedItem) => {
  const selectedProductId = ui.getSelectedProductId();
  const productToAdd = products.find((p) => p.id === selectedProductId);

  if (productToAdd && productToAdd.quantity > 0) {
    ui.addItemToCart(productToAdd, 1);
    productToAdd.quantity--;

    calculateCart();
    lastSelectedItem.value = selectedProductId;
  } else if (productToAdd && productToAdd.quantity <= 0) {
    alert('재고가 부족합니다.');
  }
};

/**
 * 장바구니 항목 변경 처리 (수량 증감, 삭제)
 */
export const handleClickCartButton = (event, products, calculateCart) => {
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

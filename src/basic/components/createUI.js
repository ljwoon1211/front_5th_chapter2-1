const createUI = () => {
  const elements = {
    selectedItemsContainer: null,
    totalPriceDisplay: null,
    productSelect: null,
    addToCartButton: null,
    stockInfoDisplay: null,
  };

  const initialize = () => {
    const root = document.getElementById('app');
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    const heading = document.createElement('h1');

    elements.selectedItemsContainer = document.createElement('div');
    elements.totalPriceDisplay = document.createElement('div');
    elements.productSelect = document.createElement('select');
    elements.addToCartButton = document.createElement('button');
    elements.stockInfoDisplay = document.createElement('div');

    elements.selectedItemsContainer.id = 'cart-items';
    elements.totalPriceDisplay.id = 'cart-total';
    elements.productSelect.id = 'product-select';
    elements.addToCartButton.id = 'add-to-cart';
    elements.stockInfoDisplay.id = 'stock-status';

    container.className = 'bg-gray-100 p-8';
    wrapper.className =
      'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
    heading.className = 'text-2xl font-bold mb-4';
    elements.totalPriceDisplay.className = 'text-xl font-bold my-4';
    elements.productSelect.className = 'border rounded p-2 mr-2';
    elements.addToCartButton.className = 'bg-blue-500 text-white px-4 py-2 rounded';
    elements.stockInfoDisplay.className = 'text-sm text-gray-500 mt-2';

    heading.textContent = '장바구니';
    elements.addToCartButton.textContent = '추가';

    wrapper.appendChild(heading);
    wrapper.appendChild(elements.selectedItemsContainer);
    wrapper.appendChild(elements.totalPriceDisplay);
    wrapper.appendChild(elements.productSelect);
    wrapper.appendChild(elements.addToCartButton);
    wrapper.appendChild(elements.stockInfoDisplay);
    container.appendChild(wrapper);
    root.appendChild(container);
  };

  // 상품 선택 옵션 업데이트
  const updateProductOptions = (products) => {
    elements.productSelect.innerHTML = '';

    products.forEach((product) => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name} - ${product.price}원`;
      if (product.quantity === 0) option.disabled = true;
      elements.productSelect.appendChild(option);
    });
  };

  // 장바구니 총액 표시 업데이트
  const updateTotalPrice = (totalAmount, discountRate) => {
    const pointsTag = document.getElementById('loyalty-points');
    elements.totalPriceDisplay.textContent = `총액: ${Math.round(totalAmount)}원`;

    if (pointsTag) {
      elements.totalPriceDisplay.appendChild(pointsTag);
    }

    if (discountRate > 0) {
      const span = document.createElement('span');
      span.className = 'text-green-500 ml-2';
      span.textContent = `(${(discountRate * 100).toFixed(1)}% 할인 적용)`;
      elements.totalPriceDisplay.appendChild(span);
    }
  };

  // 보너스 포인트 표시
  const renderBonusPoints = (bonusPoints) => {
    let pointsTag = document.getElementById('loyalty-points');

    if (!pointsTag) {
      pointsTag = document.createElement('span');
      pointsTag.id = 'loyalty-points';
      pointsTag.className = 'text-blue-500 ml-2';
      elements.totalPriceDisplay.appendChild(pointsTag);
    }

    pointsTag.textContent = `(포인트: ${bonusPoints})`;
  };

  // 재고 정보 업데이트
  const updateStockInfoDisplay = (products) => {
    let infoMsg = '';

    products.forEach((product) => {
      if (product.quantity < 5) {
        infoMsg += `${product.name}: ${product.quantity > 0 ? `재고 부족 (${product.quantity}개 남음)` : '품절'}\n`;
      }
    });

    elements.stockInfoDisplay.textContent = infoMsg;
  };

  // 장바구니에 항목 추가
  const addItemToCart = (product, quantity = 1) => {
    const selectedItemsContainer = document.getElementById('cart-items');
    const existingItem = document.getElementById(product.id);

    if (existingItem) {
      const currentQuantity = parseInt(
        existingItem.querySelector('span').textContent.split('x ')[1]
      );
      const newQuantity = currentQuantity + quantity;
      existingItem.querySelector('span').textContent =
        `${product.name} - ${product.price}원 x ${newQuantity}`;
    } else {
      const newItem = document.createElement('div');
      newItem.id = product.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML = `
        <span>${product.name} - ${product.price}원 x ${quantity}</span>
        <div>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" 
            data-product-id="${product.id}" data-change="-1">-</button>
          <button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" 
            data-product-id="${product.id}" data-change="1">+</button>
          <button class="remove-item bg-red-500 text-white px-2 py-1 rounded" 
            data-product-id="${product.id}">삭제</button>
        </div>
      `;
      selectedItemsContainer.appendChild(newItem);
    }
  };

  // UI 요소에 이벤트 리스너 연결
  const setupEventListeners = (onAddToCart, onCartItemClick) => {
    const addToCartButton = document.getElementById('add-to-cart');
    const selectedItemsContainer = document.getElementById('cart-items');

    addToCartButton.addEventListener('click', onAddToCart);
    selectedItemsContainer.addEventListener('click', onCartItemClick);
  };

  // 선택된 상품 ID 가져오기
  const getSelectedProductId = () => {
    const productSelect = document.getElementById('product-select');
    return productSelect.value;
  };

  // 장바구니 아이템 목록 가져오기
  const getCartItems = () => {
    const selectedItemsContainer = document.getElementById('cart-items');
    return selectedItemsContainer.children;
  };

  return {
    initialize,
    updateProductOptions,
    updateTotalPrice,
    renderBonusPoints,
    updateStockInfoDisplay,
    addItemToCart,
    setupEventListeners,
    getSelectedProductId,
    getCartItems,
  };
};

export default createUI;

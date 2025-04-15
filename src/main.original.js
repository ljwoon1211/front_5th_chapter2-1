let products, productSelect, addToCartButton, selectedItemsContainer, totalPriceDisplay, stockInfoDisplay;
let lastSelectedItem, bonusPoints = 0, totalAmount = 0, itemCount = 0;

const initApp = () => {
  products = [
    { id: 'p1', name: '상품1', val: 10000, q: 50 },
    { id: 'p2', name: '상품2', val: 20000, q: 30 },
    { id: 'p3', name: '상품3', val: 30000, q: 20 },
    { id: 'p4', name: '상품4', val: 15000, q: 0 },
    { id: 'p5', name: '상품5', val: 25000, q: 10 }
  ];

  const root = document.getElementById('app');
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const heading = document.createElement('h1');

  selectedItemsContainer = document.createElement('div');
  totalPriceDisplay = document.createElement('div');
  productSelect = document.createElement('select');
  addToCartButton = document.createElement('button');
  stockInfoDisplay = document.createElement('div');

  selectedItemsContainer.id = 'cart-items';
  totalPriceDisplay.id = 'cart-total';
  productSelect.id = 'product-select';
  addToCartButton.id = 'add-to-cart';
  stockInfoDisplay.id = 'stock-info';

  container.className = 'bg-gray-100 p-8';
  wrapper.className = 'max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8';
  heading.className = 'text-2xl font-bold mb-4';
  totalPriceDisplay.className = 'text-xl font-bold my-4';
  productSelect.className = 'border rounded p-2 mr-2';
  addToCartButton.className = 'bg-blue-500 text-white px-4 py-2 rounded';
  stockInfoDisplay.className = 'text-sm text-gray-500 mt-2';

  heading.textContent = '장바구니';
  addToCartButton.textContent = '추가';

  // 상품 목록 업데이트
  updateProductOptions();

  // UI 요소 배치
  wrapper.appendChild(heading);
  wrapper.appendChild(selectedItemsContainer);
  wrapper.appendChild(totalPriceDisplay);
  wrapper.appendChild(productSelect);
  wrapper.appendChild(addToCartButton);
  wrapper.appendChild(stockInfoDisplay);
  container.appendChild(wrapper);
  root.appendChild(container);

  calcCart();

  // 타이머 설정
  setupFlashSaleTimer();
  setupProductSuggestionTimer();

  // 이벤트 리스너 설정
  addToCartButton.addEventListener('click', handleAddToCart);
  selectedItemsContainer.addEventListener('click', handleCartAction);
};

/**
 * 번개세일 타이머 설정
 */
const setupFlashSaleTimer = () => {
  setTimeout(() => {
    setInterval(() => {
      const luckyItem = products[Math.floor(Math.random() * products.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        updateProductOptions();
      }
    }, 30000);
  }, Math.random() * 10000);
};

/**
 * 상품 추천 타이머 설정
 */
const setupProductSuggestionTimer = () => {
  setTimeout(() => {
    setInterval(() => {
      if (lastSelectedItem) {
        const suggest = products.find(item => item.id !== lastSelectedItem && item.q > 0);
        if (suggest) {
          alert(suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.val = Math.round(suggest.val * 0.95);
          updateProductOptions();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
};

/**
 * 상품 선택 옵션 업데이트 
 */
const updateProductOptions = () => {
  productSelect.innerHTML = '';
  products.forEach(product => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} - ${product.val}원`;
    if (product.q === 0) option.disabled = true;
    productSelect.appendChild(option);
  });
};

/**
 * 장바구니 계산
 */
const calcCart = () => {
  totalAmount = 0;
  itemCount = 0;
  let subTotal = 0;

  const cartItems = selectedItemsContainer.children;

  // for문으로 아이템별 수량, 가격 계산
  for (let i = 0; i < cartItems.length; i++) {
    const result = processCartItem(cartItems[i], subTotal);
    subTotal = result.subTotal;
  }

  let discountRate = 0;

  // 아이템 수량 별 할인율
  if (itemCount >= 30) {
    const bulkDiscount = totalAmount * 0.25;
    const itemDiscount = subTotal - totalAmount;

    if (bulkDiscount > itemDiscount) {
      totalAmount = subTotal * (1 - 0.25);
      discountRate = 0.25;
    }
    else {
      discountRate = (subTotal - totalAmount) / subTotal;
    }
  }
  else {
    discountRate = (subTotal - totalAmount) / subTotal;
  }

  if (new Date().getDay() === 2) {
    totalAmount *= (1 - 0.1);
    discountRate = Math.max(discountRate, 0.1);
  }

  // 기존 내용 초기화
  totalPriceDisplay.textContent = '총액: ' + Math.round(totalAmount) + '원';

  if (discountRate > 0) {
    const span = document.createElement('span');
    span.className = 'text-green-500 ml-2';
    span.textContent = '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)';
    totalPriceDisplay.appendChild(span);
  }

  updateStockInfoDisplay();
  renderBonusPoints();
};

/**
 * for문으로 아이템별 수량, 가격 계산
 * @param {HTMLElement} cartItem - 처리할 장바구니 아이템 요소
 * @param {number} currentSubTotal - 현재까지의 소계
 * @returns {Object} 업데이트된 소계를 포함한 객체
 */
const processCartItem = (cartItem, currentSubTotal) => {
  let subTotal = currentSubTotal;
  let currentProduct;

  for (let j = 0; j < products.length; j++) {
    if (products[j].id === cartItem.id) {
      currentProduct = products[j];
      break;
    }
  }

  const quantity = parseInt(cartItem.querySelector('span').textContent.split('x ')[1]);
  const itemTotal = currentProduct.val * quantity;
  let discountRate = 0;

  itemCount += quantity;
  subTotal += itemTotal;

  if (quantity >= 10) {
    if (currentProduct.id === 'p1') discountRate = 0.1;
    else if (currentProduct.id === 'p2') discountRate = 0.15;
    else if (currentProduct.id === 'p3') discountRate = 0.2;
    else if (currentProduct.id === 'p4') discountRate = 0.05;
    else if (currentProduct.id === 'p5') discountRate = 0.25;
  }

  totalAmount += itemTotal * (1 - discountRate);

  return { subTotal };
};

/**
 * 보너스 포인트 표시
 */
const renderBonusPoints = () => {
  bonusPoints = Math.floor(totalAmount / 1000);
  let pointsTag = document.getElementById('loyalty-points');
  if (!pointsTag) {
    pointsTag = document.createElement('span');
    pointsTag.id = 'loyalty-points';
    pointsTag.className = 'text-blue-500 ml-2';
    totalPriceDisplay.appendChild(pointsTag);
  }
  pointsTag.textContent = '(포인트: ' + bonusPoints + ')';
};

/**
 * 재고 정보 업데이트
 */
const updateStockInfoDisplay = () => {
  let infoMsg = '';
  products.forEach((product) => {
    if (product.q < 5) {
      infoMsg += product.name + ': ' + (product.q > 0 ? '재고 부족 (' + product.q + '개 남음)' : '품절') + '\n';
    }
  });
  stockInfoDisplay.textContent = infoMsg;
};

/**
 * 장바구니에 상품 추가 처리
 */
const handleAddToCart = () => {
  const selectedProductId = productSelect.value;
  const productToAdd = products.find(p => p.id === selectedProductId);

  if (productToAdd && productToAdd.q > 0) {
    const existingItem = document.getElementById(productToAdd.id);

    if (existingItem) {
      const newQuantity = parseInt(existingItem.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQuantity <= productToAdd.q) {
        existingItem.querySelector('span').textContent = productToAdd.name + ' - ' + productToAdd.val + '원 x ' + newQuantity;
        productToAdd.q--;
      } else {
        alert('재고가 부족합니다.');
      }
    } else {
      const newItem = document.createElement('div');
      newItem.id = productToAdd.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML = '<span>' + productToAdd.name + ' - ' + productToAdd.val + '원 x 1</span><div>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' + productToAdd.id + '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' + productToAdd.id + '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' + productToAdd.id + '">삭제</button></div>';
      selectedItemsContainer.appendChild(newItem);
      productToAdd.q--;
    }
    calcCart();
    lastSelectedItem = selectedProductId;
  }
};

/**
 * 장바구니 항목 변경 처리 (수량 증감, 삭제)
 */
const handleCartAction = (event) => {
  const targetElement = event.target;

  if (targetElement.classList.contains('quantity-change') || targetElement.classList.contains('remove-item')) {
    const productId = targetElement.dataset.productId;
    const itemElement = document.getElementById(productId);
    const product = products.find(p => p.id === productId);

    if (targetElement.classList.contains('quantity-change')) {
      const quantityChange = parseInt(targetElement.dataset.change);
      const currentQuantity = parseInt(itemElement.querySelector('span').textContent.split('x ')[1]);
      const newQuantity = currentQuantity + quantityChange;

      if (newQuantity > 0 && (quantityChange < 0 || newQuantity <= product.q + currentQuantity)) {
        itemElement.querySelector('span').textContent = itemElement.querySelector('span').textContent.split('x ')[0] + 'x ' + newQuantity;
        product.q -= quantityChange;
      } else if (newQuantity <= 0) {
        itemElement.remove();
        product.q -= quantityChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (targetElement.classList.contains('remove-item')) {
      const removedQuantity = parseInt(itemElement.querySelector('span').textContent.split('x ')[1]);
      product.q += removedQuantity;
      itemElement.remove();
    }
    calcCart();
  }
};

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
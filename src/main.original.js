let products, productSelect, addToCartButton, selectedItemsContainer, totalPriceDisplay, stockInfoDisplay;
let lastSelectedItem, bonusPoints = 0, totalAmount = 0, itemCount = 0;
const initializeApp = () => {
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
  wrapper.appendChild(addBtn);
  wrapper.appendChild(stockInfoDisplay);
  container.appendChild(wrapper);
  root.appendChild(container);


  calcCart();
  setTimeout(function () {
    setInterval(function () {
      var luckyItem = prodList[Math.floor(Math.random() * prodList.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert('번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        updateProductOptions();
      }
    }, 30000);
  }, Math.random() * 10000);
  setTimeout(function () {
    setInterval(function () {
      if (lastSelectedItem) {
        var suggest = prodList.find(function (item) { return item.id !== lastSelectedItem && item.q > 0; });
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
    option.textContent = `${product.name} - ${product.price}원`;
    if (product.stock === 0) option.disabled = true;
    productSelect.appendChild(option);
  });
};




const calcCart = () => {
  totalAmount = 0;
  itemCount = 0;
  const cartItems = selectedItemsContainer.children;
  let subTotal = 0;

  //for문으로 아이템별 수량, 가격 계산
  for (let i = 0; i < cartItems.length; i++) {
    processCartItem(cartItems[i]);
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
  totalPriceDisplay.textContent = '총액: ' + Math.round(totalAmount) + '원';

  if (discountRate > 0) {
    const span = document.createElement('span');
    span.className = 'text-green-500 ml-2';
    span.textContent = '(' + (discountRate * 100).toFixed(1) + '% 할인 적용)';
    totalPriceDisplay.appendChild(span);
  }

  updateStockInfoDisplay();
  renderBonusPoints();
}

/**
 * for문으로 아이템별 수량, 가격 계산
 * @param {*} cartItem - 처리할 장바구니 아이템 요소
 */
const processCartItem = (cartItem) => {
  let currentProduct;
  for (let j = 0; j < products.length; j++) {
    if (products[j].id === cartItem.id) {
      currentProduct = products[j];
      break;
    }
  }

  const quantity = parseInt(cartItem.querySelector('span').textContent.split('x ')[1]);
  const itemTotal = currentProduct.price * quantity;
  let discountRate = 0;

  itemCount += quantity;
  subtotal += itemTotal;

  if (quantity >= 10) {
    if (currentProduct.id === 'p1') discountRate = 0.1;
    else if (currentProduct.id === 'p2') discountRate = 0.15;
    else if (currentProduct.id === 'p3') discountRate = 0.2;
    else if (currentProduct.id === 'p4') discountRate = 0.05;
    else if (currentProduct.id === 'p5') discountRate = 0.25;
  }

  totalAmount += itemTotal * (1 - discountRate);
};

const renderBonusPoints = () => {
  bonusPoints = Math.floor(totalAmount / 1000);
  const ptsTag = document.getElementById('loyalty-points');
  if (!ptsTag) {
    ptsTag = document.createElement('span');
    ptsTag.id = 'loyalty-points';
    ptsTag.className = 'text-blue-500 ml-2';
    totalPriceDisplay.appendChild(ptsTag);
  }
  ptsTag.textContent = '(포인트: ' + bonusPoints + ')';
};

const updateStockInfoDisplay = () => {
  let infoMsg = '';
  products.forEach((product) => {
    if (product.quantity < 5) {
      infoMsg += product.name + ': ' + (product.quantity > 0 ? '재고 부족 (' + product.quantity + '개 남음)' : '품절') + '\n';
    }
  });
  stockInfoDisplay.textContent = infoMsg;
}

main();
addBtn.addEventListener('click', function () {
  const selectedItem = productSelect.value;
  var itemToAdd = prodList.find(function (p) { return p.id === selectedItem; });
  if (itemToAdd && itemToAdd.q > 0) {
    var item = document.getElementById(itemToAdd.id);
    if (item) {
      var newQty = parseInt(item.querySelector('span').textContent.split('x ')[1]) + 1;
      if (newQty <= itemToAdd.q) {
        item.querySelector('span').textContent = itemToAdd.name + ' - ' + itemToAdd.val + '원 x ' + newQty;
        itemToAdd.q--;
      } else { alert('재고가 부족합니다.'); }
    } else {
      var newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className = 'flex justify-between items-center mb-2';
      newItem.innerHTML = '<span>' + itemToAdd.name + ' - ' + itemToAdd.val + '원 x 1</span><div>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' + itemToAdd.id + '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' + itemToAdd.id + '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' + itemToAdd.id + '">삭제</button></div>';
      selectedItemsContainer.appendChild(newItem);
      itemToAdd.q--;
    }
    calcCart();
    lastSelectedItem = selectedItem;
  }
});
selectedItemsContainer.addEventListener('click', function (event) {
  var tgt = event.target;
  if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
    var prodId = tgt.dataset.productId;
    var itemElem = document.getElementById(prodId);
    var prod = prodList.find(function (p) { return p.id === prodId; });
    if (tgt.classList.contains('quantity-change')) {
      var qtyChange = parseInt(tgt.dataset.change);
      var newQty = parseInt(itemElem.querySelector('span').textContent.split('x ')[1]) + qtyChange;
      if (newQty > 0 && newQty <= prod.q + parseInt(itemElem.querySelector('span').textContent.split('x ')[1])) {
        itemElem.querySelector('span').textContent = itemElem.querySelector('span').textContent.split('x ')[0] + 'x ' + newQty;
        prod.q -= qtyChange;
      } else if (newQty <= 0) {
        itemElem.remove();
        prod.q -= qtyChange;
      } else {
        alert('재고가 부족합니다.');
      }
    } else if (tgt.classList.contains('remove-item')) {
      var remQty = parseInt(itemElem.querySelector('span').textContent.split('x ')[1]);
      prod.q += remQty;
      itemElem.remove();
    }
    calcCart();
  }
});
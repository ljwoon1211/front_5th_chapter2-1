import createUI from './components/createUI';
import initialProducts from './data/products';
import { initializeCart } from './utils/calculateCarts';
import { handleAddToCart, handleClickCartButton } from './utils/eventHandler';
import { setupFlashSaleTimer, setupProductSuggestionTimer } from './utils/promotion';
import { getState, initState, subscribe } from './utils/state';

// UI 모듈 전역 선언
let ui;

const initApp = () => {
  initState(initialProducts);

  ui = createUI();
  ui.initialize();
  ui.updateProductOptions(getState().products);

  subscribe((state) => {
    // 상품 목록이 변경되었을 때만 업데이트 (성능 최적화)
    ui.updateStockInfoDisplay(state.products);
  });
  // 초기 장바구니 상태 표시
  initializeCart(ui);

  const addToCartHandler = () => handleAddToCart(ui);
  const cartItemClickHandler = (event) => handleClickCartButton(event, ui);

  // 이벤트 리스너 설정
  ui.setupEventListeners(addToCartHandler, cartItemClickHandler);

  // 추가 기능 설정
  setupFlashSaleTimer(getState().products, ui.updateProductOptions);
  setupProductSuggestionTimer(getState().products, ui.updateProductOptions, () => getState().lastSelectedItem);
};

initApp();

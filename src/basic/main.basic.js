import createUI from './components/createUI';
import initialProducts from './data/products';
import { initializeCart } from './utils/calculateCarts';
import { handleAddToCart, handleClickCartButton } from './utils/eventHandler';
import { setupFlashSaleTimer, setupProductSuggestionTimer } from './utils/promotion';
import { getState, initState, subscribe } from './utils/state';

const initApp = () => {
  initState(initialProducts);

  const ui = createUI();
  ui.initialize();
  ui.updateProductOptions(getState().products);

  window.ui = ui;

  subscribe((state) => {
    ui.updateStockInfoDisplay(state.products);
  });

  initializeCart(ui);

  const addToCartHandler = () => handleAddToCart(ui);
  const cartItemClickHandler = (event) => handleClickCartButton(event, ui);

  ui.setupEventListeners(addToCartHandler, cartItemClickHandler);

  setupFlashSaleTimer(ui.updateProductOptions);
  setupProductSuggestionTimer(ui.updateProductOptions, () => getState().lastSelectedItem);
};

initApp();

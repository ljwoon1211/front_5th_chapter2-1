export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AppState {
  products: Product[];
  lastSelectedItem: string | null;
  bonusPoints: number;
  totalAmount: number;
  itemCount: number;
}

export interface UI {
  initialize: () => void;
  updateProductOptions: (products: Product[]) => void;
  updateTotalPrice: (totalAmount: number, discountRate: number) => void;
  renderBonusPoints: (bonusPoints: number) => void;
  updateStockInfoDisplay: (products: Product[]) => void;
  addItemToCart: (product: Product, quantity?: number) => void;
  setupEventListeners: (onAddToCart: () => void, onCartItemClick: (event: React.MouseEvent) => void) => void;
  getSelectedProductId: () => string;
  getCartItems: () => HTMLCollection | NodeListOf<HTMLElement> | any[];
}
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
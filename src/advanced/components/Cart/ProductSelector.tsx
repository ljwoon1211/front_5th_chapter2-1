import React from 'react';
import { Product } from '../../types';
import Button from '../UI/Button';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
  onAddToCart: () => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedProductId,
  onProductSelect,
  onAddToCart,
}) => {
  return (
    <div className="flex items-center">
      <select
        id="product-select"
        className="border rounded p-2 mr-2"
        value={selectedProductId}
        onChange={(e) => onProductSelect(e.target.value)}
      >
        {products.map((product) => (
          <option key={product.id} value={product.id} disabled={product.quantity === 0}>
            {product.name} - {product.price}원
          </option>
        ))}
      </select>

      <Button id="add-to-cart" onClick={onAddToCart}>
        추가
      </Button>
    </div>
  );
};

export default ProductSelector;

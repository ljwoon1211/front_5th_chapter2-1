import React from 'react';
import { Product } from '../../types';

interface StockInfoProps {
  products: Product[];
}

export const StockInfo: React.FC<StockInfoProps> = ({ products }) => {
  const lowStockProducts = products.filter((product) => product.quantity < 5);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div id="stock-status" className="text-sm text-gray-500 mt-2">
      {lowStockProducts.map((product) => (
        <div key={product.id}>
          {product.name}: {product.quantity > 0 ? `재고 부족 (${product.quantity}개 남음)` : '품절'}
        </div>
      ))}
    </div>
  );
};

export default StockInfo;

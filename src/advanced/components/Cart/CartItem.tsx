import React from 'react';
import { CartItem as CartItemType } from '../../types/index';
import Button from '../UI/Button';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, change: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const { product, quantity } = item;

  return (
    <div id={product.id} className="flex justify-between items-center mb-2">
      <span>
        {product.name} - {product.price}원 x {quantity}
      </span>
      <div>
        <Button
          size="small"
          className="mr-1"
          data-product-id={product.id}
          data-change="-1"
          onClick={() => onQuantityChange(product.id, -1)}
        >
          -
        </Button>
        <Button
          size="small"
          className="mr-1"
          data-product-id={product.id}
          data-change="1"
          onClick={() => onQuantityChange(product.id, 1)}
        >
          +
        </Button>
        <Button
          variant="danger"
          size="small"
          data-product-id={product.id}
          onClick={() => onRemove(product.id)}
        >
          삭제
        </Button>
      </div>
    </div>
  );
};

export default CartItem;

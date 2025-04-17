import React from 'react';
import { CartItem as CartItemType } from '../../types/index';
import CartItem from './CartItem';

interface CartItemListProps {
  items: CartItemType[];
  onQuantityChange: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  items,
  onQuantityChange,
  onRemoveItem,
}) => {
  if (items.length === 0) {
    return <div className="text-gray-500 py-4 text-center">장바구니가 비어 있습니다.</div>;
  }

  return (
    <div id="cart-items">
      {items.map((item) => (
        <CartItem
          key={item.product.id}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
};

export default CartItemList;

import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="flex gap-3 p-3 bg-card rounded-xl shadow-card">
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
          <button
            onClick={() => removeItem(item.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold">{formatPrice((item.price * item.quantity).toFixed(2))}</span>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 rounded-full"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-6 text-center font-semibold text-foreground">{item.quantity}</span>
            <Button
              size="icon"
              className="h-7 w-7 rounded-full btn-primary"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

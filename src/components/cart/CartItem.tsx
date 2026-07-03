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
        className="w-16 h-16 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground text-sm truncate flex-1">{item.name}</h4>
          <button
            onClick={() => removeItem(item.id)}
            aria-label="إزالة"
            className="shrink-0 -m-2 p-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
          <span className="text-primary font-bold whitespace-nowrap">{formatPrice((item.price * item.quantity).toFixed(2))}</span>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="icon"
              variant="outline"
              aria-label="إنقاص الكمية"
              className="h-9 w-9 rounded-full touch-manipulation"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-6 text-center font-semibold text-foreground tabular-nums">{item.quantity}</span>
            <Button
              size="icon"
              aria-label="زيادة الكمية"
              className="h-9 w-9 rounded-full btn-primary touch-manipulation"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

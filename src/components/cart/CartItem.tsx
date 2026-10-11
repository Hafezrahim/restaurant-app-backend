import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
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
  const name = item.nameAr || item.name;

  return (
    <article className="flex gap-3 border-b border-border py-4 last:border-b-0 sm:gap-4">
      <img
        src={item.image}
        alt={name}
        className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 break-words text-sm font-bold leading-6 text-foreground sm:text-base">{name}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(item.id)}
            aria-label={`إزالة ${name}`}
            title={`إزالة ${name}`}
            className="-mt-1 h-10 w-10 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">{formatPrice(item.price)} / قطعة</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex shrink-0 items-center rounded-lg border border-border bg-card">
            <Button
              size="icon"
              variant="ghost"
              aria-label={`زيادة كمية ${name}`}
              title="زيادة الكمية"
              className="h-11 w-11 touch-manipulation text-primary"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <span aria-label={`الكمية ${item.quantity}`} className="w-7 text-center font-semibold text-foreground tabular-nums">{item.quantity}</span>
            <Button
              size="icon"
              variant="ghost"
              aria-label={item.quantity === 1 ? `إزالة ${name} من السلة` : `إنقاص كمية ${name}`}
              title={item.quantity === 1 ? 'إزالة من السلة' : 'إنقاص الكمية'}
              className="h-11 w-11 touch-manipulation text-muted-foreground"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            </Button>
          </div>
          <span className="whitespace-nowrap font-bold text-foreground tabular-nums">{formatPrice((item.price * item.quantity).toFixed(2))}</span>
        </div>
      </div>
    </article>
  );
};

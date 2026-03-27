import React from 'react';
import { menuItems } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const POSGrid: React.FC = () => {
  const { addItem } = useCart();

  const handleQuickAdd = (item: typeof menuItems[0]) => {
    addItem(item);
    toast({
      title: 'تمت الإضافة!',
      description: item.name,
    });
  };

  return (
    <div className="mt-6">
      <p className="text-xs text-muted-foreground text-center mb-3">
        اضغط على الأطباق لإضافتها مباشرة
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {menuItems.slice(0, 12).map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleQuickAdd(item)}
            className={cn(
              'pos-grid-item opacity-0 animate-scale-in',
              `stagger-${Math.min(index + 1, 5)}`
            )}
            style={{ animationFillMode: 'forwards' }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2 md:p-3">
              <p className="text-primary-foreground text-xs md:text-sm font-medium truncate">
                {item.name}
              </p>
              <p className="text-secondary text-xs md:text-base font-bold">{item.price} ر.س</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

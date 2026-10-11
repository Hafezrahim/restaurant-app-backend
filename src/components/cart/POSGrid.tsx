import React, { useState } from 'react';
import { Plus, Search, ShoppingCart, X } from 'lucide-react';
import { useMenuItems } from '@/backend/hooks/useMenuData';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';
import { MenuItem } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const POSGrid: React.FC = () => {
  const { addItem, items } = useCart();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState('');
  const { data: menuItems = [] } = useMenuItems();
  const visibleItems = menuItems.filter((item) => `${item.nameAr || ''} ${item.name}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

  const handleQuickAdd = (item: MenuItem) => {
    addItem(item);
    toast({
      title: 'تمت الإضافة!',
      description: item.name,
    });
  };

  return (
    <section aria-labelledby="quick-add-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="quick-add-title" className="flex items-center gap-2 text-lg font-bold"><ShoppingCart className="h-5 w-5 text-primary" /> أضف إلى طلبك</h2>
        <span className="text-xs text-muted-foreground">{visibleItems.length} طبق</span>
      </div>
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input aria-label="البحث عن طبق" placeholder="ابحث عن طبقك المفضل" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 bg-card pl-11 pr-10" />
        {search && <Button variant="ghost" size="icon" aria-label="مسح البحث" title="مسح البحث" className="absolute left-0 top-0 h-11 w-11" onClick={() => setSearch('')}><X /></Button>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((item) => {
          const quantity = items.find((selected) => selected.id === item.id)?.quantity || 0;
          const name = item.nameAr || item.name;
          return (
            <Button key={item.id} variant="outline" aria-label={`إضافة ${name} إلى السلة`} onClick={() => handleQuickAdd(item)} className="group relative block h-auto min-w-0 overflow-hidden whitespace-normal rounded-lg border-border bg-card p-0 text-start hover:border-primary/50 hover:bg-card hover:text-foreground">
              <div className="relative aspect-square overflow-hidden">
                <img src={item.image} alt={name} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 motion-safe:group-hover:scale-105" />
                {quantity > 0 && <span className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-accent px-2 text-xs font-bold text-accent-foreground" aria-label={`${quantity} في السلة`}>{quantity}</span>}
                <span className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card"><Plus className="h-4 w-4" /></span>
              </div>
              <div className="p-3">
                <p className="min-h-10 break-words text-sm font-semibold leading-5 text-foreground line-clamp-2">{name}</p>
                <p className="mt-2 text-sm font-bold text-primary">{formatPrice(item.price)}</p>
              </div>
            </Button>
          );
        })}
      </div>
      {visibleItems.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">لا توجد أطباق مطابقة للبحث</p>}
    </section>
  );
};

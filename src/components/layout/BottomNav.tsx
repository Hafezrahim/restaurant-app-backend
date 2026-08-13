import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, Heart, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/menu', icon: UtensilsCrossed, label: 'القائمة' },
  { path: '/cart', icon: ShoppingCart, label: 'السلة', isFloating: true },
  { path: '/favorites', icon: Heart, label: 'المفضلة' },
  { path: '/more', icon: Menu, label: 'المزيد' },
];

export const BottomNav = React.forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-2 pb-safe md:hidden">
      <div className="flex items-end justify-around h-[var(--nav-height)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isFloating) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="floating-button transform transition-transform duration-200 active:scale-90"
              >
                <Icon className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in">
                    {totalItems}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn('nav-item py-2 px-3 flex-1', isActive && 'active')}
            >
              <Icon className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

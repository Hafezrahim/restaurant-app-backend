import React from 'react';
import { Home, UtensilsCrossed, Heart, ShoppingCart } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useCart } from '@/context/CartContext';

const menuItems = [
  { to: '/', label: 'الرئيسية' },
  { to: '/menu', label: 'القائمة' },
  { to: '/reservation', label: 'حجز طاولة' },
  { to: '/about', label: 'من نحن' },
];

const mobileNavItems = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/menu', icon: UtensilsCrossed, label: 'القائمة' },
  { to: '/reservation', icon: UtensilsCrossed, label: 'حجز طاولة', hideIcon: true },
  { to: '/about', icon: UtensilsCrossed, label: 'من نحن', hideIcon: true },
  { to: '/favorites', icon: Heart, label: 'المفضلة', iconOnly: true },
  { to: '/cart', icon: ShoppingCart, label: 'السلة', iconOnly: true },
];

export const WebNav: React.FC = () => {
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Desktop: text-only menu links */}
      <nav className="hidden md:flex items-center gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="px-4 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            activeClassName="text-primary bg-primary/10 font-medium"
          >
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile: icon nav */}
      <nav className="flex md:hidden items-center gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isCart = item.to === '/cart';
          const hideIcon = (item as any).hideIcon;
          const iconOnly = (item as any).iconOnly;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex items-center gap-2 ${iconOnly ? 'p-2' : 'px-4 py-2'} rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200`}
              activeClassName="text-primary bg-primary/10 font-medium"
            >
              {!hideIcon && <Icon className="w-5 h-5" />}
              {!iconOnly && <span className="text-sm">{item.label}</span>}
              {isCart && totalItems > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

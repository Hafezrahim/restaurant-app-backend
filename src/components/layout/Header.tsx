import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserCircle, LayoutDashboard, X, CheckCheck, Gift, ShoppingBag, Info, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import { useClientAuth } from '@/context/ClientAuthContext';
import { useNotifications, ClientNotification } from '@/context/NotificationsContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WebNav } from './WebNav';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/hooks/useUserRole';
import logo from '@/assets/logo.png';


interface HeaderProps {
  showSearch?: boolean;
  title?: string;
}

const notifIcons: Record<string, React.ReactNode> = {
  order: <ShoppingBag className="w-4 h-4 text-primary" />,
  reward: <Gift className="w-4 h-4 text-secondary" />,
  info: <Info className="w-4 h-4 text-accent" />,
};

export const Header: React.FC<HeaderProps> = ({ showSearch = true, title }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useClientAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3" dir="rtl">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Right (RTL Start) - Logo */}
        <div className="flex items-center gap-2">
          {title ? (
            <h1 className="text-lg font-bold text-foreground md:hidden">{title}</h1>
          ) : null}
          <div className={`flex items-center gap-2 ${title ? 'hidden md:flex' : 'flex'}`}>
            <img src={logo} alt="مزاج" className="w-12 h-12 rounded-full object-cover" />
          </div>
        </div>

        {/* Center - Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <WebNav />
        </div>

        {/* Left (RTL End) - Action Icons */}
        <div className="flex items-center gap-1">

          {/* Desktop action icons: Wishlist, Cart, Sign-in/Dashboard, Notifications */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:inline-flex rounded-full hover:bg-muted relative" onClick={() => navigate('/favorites')}>
                  <Heart className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>المفضلة</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:inline-flex rounded-full hover:bg-muted relative" onClick={() => navigate('/cart')}>
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-secondary text-secondary-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>السلة</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => navigate(isAuthenticated ? '/client/dashboard' : '/client/login')}>
                  {isAuthenticated ? <LayoutDashboard className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{isAuthenticated ? 'لوحة التحكم' : 'تسجيل الدخول'}</p></TooltipContent>
            </Tooltip>

            {isAuthenticated && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted relative" onClick={() => setShowNotifs(!showNotifs)}>
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>الإشعارات</p></TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>

          {isAuthenticated && showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute left-0 top-12 w-80 bg-card rounded-2xl shadow-xl border border-border z-50 overflow-hidden" dir="rtl">
                <div className="flex items-center justify-between p-3 border-b border-border">
                  <h3 className="font-bold text-sm text-foreground">الإشعارات</h3>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
                        <CheckCheck className="w-3 h-3 ml-1" />
                        قراءة الكل
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNotifs(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">لا توجد إشعارات</p>
                    </div>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-right p-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{notifIcons[n.type]}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Headphones, UserCircle, LogOut, Gift } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useClientAuth } from '@/context/ClientAuthContext';
import { toast } from 'sonner';

const navItems = [
  { to: '/client/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/client/orders', icon: ShoppingBag, label: 'طلباتي' },
  { to: '/client/rewards', icon: Gift, label: 'المكافآت' },
  { to: '/client/wishlist', icon: Heart, label: 'المفضلة' },
  { to: '/client/support', icon: Headphones, label: 'الدعم' },
  { to: '/client/profile', icon: UserCircle, label: 'الملف الشخصي' },
];

export const ClientLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { user, logout } = useClientAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/');
  };

  return (
    <AppLayout title={title} showSearch={false}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-card rounded-2xl shadow-card p-4 space-y-1">
            {/* User info */}
            <div className="text-center pb-4 border-b border-border mb-3">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="font-bold text-foreground text-sm">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>

            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors w-full mt-2"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AppLayout>
  );
};

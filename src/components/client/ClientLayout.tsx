import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Headphones, UserCircle, LogOut, Gift, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { useClientAuth } from '@/context/ClientAuthContext';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const navItems = [
  { to: '/client/dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
  { to: '/client/orders', icon: ShoppingBag, label: 'طلباتي' },
  { to: '/client/rewards', icon: Gift, label: 'المكافآت' },
  { to: '/client/wishlist', icon: Heart, label: 'المفضلة' },
  { to: '/client/support', icon: Headphones, label: 'الدعم' },
  { to: '/client/profile', icon: UserCircle, label: 'حسابي' },
];

export const ClientLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { user, logout } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
    navigate('/');
  };

  return (
    <>
      <Helmet><title>{title} - مطعم مزاج</title></Helmet>
      <div className="min-h-screen bg-background" dir="rtl">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:block sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.name}</span>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6 px-4 py-4">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-card rounded-2xl shadow-card p-4 space-y-1 sticky top-20">
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
          <main className="flex-1 min-w-0 pb-20 md:pb-4">{children}</main>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden safe-area-bottom">
          <div className="flex items-center justify-around h-16">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive ? 'bg-primary/15 scale-110' : ''
                  }`}>
                    <item.icon className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

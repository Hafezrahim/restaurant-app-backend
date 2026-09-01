import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Headphones, UserCircle, LogOut, Gift, LayoutDashboard, ChevronLeft, Home } from 'lucide-react';
import { useClientAuth } from '@/context/ClientAuthContext';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import logo from '@/assets/logo.png';

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
      <div className="min-h-screen bg-[hsl(220,20%,97%)] dark:bg-background" dir="rtl">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-40 md:hidden">
          <div className="bg-gradient-to-l from-primary via-primary to-primary/90 px-4 py-4 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="مزاج" className="w-9 h-9 rounded-xl object-cover border-2 border-white/20" />
                <div>
                  <h1 className="text-base font-bold text-white">{title}</h1>
                  <p className="text-[10px] text-white/60">مرحباً {user?.name?.split(' ')[0]}</p>
                </div>
              </div>
              <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          {/* Curved bottom */}
          <div className="h-4 bg-gradient-to-b from-primary/90 to-transparent rounded-b-[24px] -mt-1" 
               style={{ background: 'linear-gradient(to bottom, hsl(var(--primary)), transparent)' }} />
        </header>

        {/* Desktop Header */}
        <header className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/15 transition-colors">
                <Home className="w-4 h-4 text-primary" />
              </button>
              <div className="w-px h-6 bg-border/50" />
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="مزاج" className="w-8 h-8 rounded-lg object-cover" />
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-sm font-bold shadow-md overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'الصورة الشخصية'} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'م'
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 px-4 md:px-6 py-4 md:py-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border/20 overflow-hidden sticky top-20">
              {/* User Card */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-5 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white shadow-lg overflow-hidden">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user?.name || 'الصورة الشخصية'} className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'م'
                    )}
                  </div>
                  <p className="font-bold text-white text-base">{user?.name}</p>
                  <p className="text-xs text-white/60 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Nav Items */}
              <div className="p-3 space-y-0.5">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary font-bold shadow-sm'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`
                    }
                  >
                    <item.icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </NavLink>
                ))}
              </div>

              <div className="border-t border-border/20 p-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors w-full"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 pb-24 md:pb-6">{children}</main>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="bg-white/90 dark:bg-card/90 backdrop-blur-xl border-t border-border/20 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-around h-[68px] px-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
                  >
                    {isActive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
                    )}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105' : 'text-muted-foreground'
                    }`}>
                      <item.icon className="w-[18px] h-[18px]" />
                    </div>
                    <span className={`text-[10px] font-semibold transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

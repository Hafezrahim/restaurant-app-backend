import React from 'react';
import { ShoppingBag, Heart, Clock, TrendingUp, Star, Utensils, CalendarDays, ArrowLeft, Sparkles } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useClientAuth } from '@/context/ClientAuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useRewards, MIN_REDEEM, TIERS } from '@/context/RewardsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useNavigate } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
  const { user } = useClientAuth();
  const { favorites } = useFavorites();
  const { points, pointsValue, canRedeem, tier, totalEarned } = useRewards();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const orders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');
  const activeOrders = orders.filter((o: any) => !['delivered', 'cancelled'].includes(o.status));
  const totalSpent = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);

  const stats = [
    { icon: ShoppingBag, label: 'إجمالي الطلبات', value: orders.length, gradient: 'from-primary/15 to-primary/5', iconBg: 'bg-primary/20', iconColor: 'text-primary', link: '/client/orders' },
    { icon: Heart, label: 'المفضلة', value: favorites.length, gradient: 'from-secondary/15 to-secondary/5', iconBg: 'bg-secondary/20', iconColor: 'text-secondary', link: '/client/wishlist' },
    { icon: Clock, label: 'طلبات نشطة', value: activeOrders.length, gradient: 'from-accent/15 to-accent/5', iconBg: 'bg-accent/20', iconColor: 'text-accent', link: '/client/orders' },
    { icon: TrendingUp, label: 'إجمالي المصروف', value: formatPrice(totalSpent.toFixed(0)), gradient: 'from-destructive/10 to-destructive/5', iconBg: 'bg-destructive/15', iconColor: 'text-destructive', link: '/client/orders' },
  ];

  return (
    <ClientLayout title="لوحة التحكم">
      <div className="space-y-5">
        {/* Welcome */}
        <div className="bg-white dark:bg-card rounded-2xl p-5 border border-border/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-secondary/5 to-transparent rounded-tr-full" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
              {user?.name?.charAt(0) || '👋'}
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">مرحباً بعودتك</p>
              <h2 className="text-xl font-bold text-foreground">{user?.name} 👋</h2>
              <p className="text-xs text-muted-foreground mt-0.5">إليك ملخص حسابك اليوم</p>
            </div>
          </div>
        </div>

        {/* Active Orders Banner */}
        {activeOrders.length > 0 && (
          <button
            onClick={() => navigate('/client/orders')}
            className="w-full bg-gradient-to-l from-accent/15 via-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center gap-3 hover:from-accent/20 transition-all text-right group"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">لديك {activeOrders.length} طلب نشط</p>
              <p className="text-xs text-muted-foreground truncate">
                {activeOrders[0]?.trackingNumber} - {activeOrders[0]?.items?.[0]?.name || 'طلب جاري'}
              </p>
            </div>
            <ArrowLeft className="w-4 h-4 text-accent group-hover:-translate-x-1 transition-transform shrink-0" />
          </button>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(s.link)}
              className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-4 text-right border border-border/10 hover:shadow-md active:scale-[0.97] transition-all duration-200 group`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Rewards Card */}
        <div className={`bg-gradient-to-br ${tier.color} rounded-2xl p-5 text-white relative overflow-hidden shadow-lg`}>
          <div className="absolute -top-6 -left-6 text-8xl opacity-10">{tier.icon}</div>
          <div className="absolute bottom-2 right-2 text-6xl opacity-5 rotate-12">{tier.icon}</div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                {tier.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">×{tier.multiplier}</span>
                </div>
                <p className="text-xs text-white/60">{totalEarned} نقطة مكتسبة</p>
              </div>
              <div className="text-left">
                <p className="text-3xl font-bold leading-none">{points}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{formatPrice(pointsValue.toFixed(0))}</p>
              </div>
            </div>

            {tier.nextTier && (
              <div>
                <div className="flex justify-between text-[10px] text-white/60 mb-1.5">
                  <span>{tier.name}</span>
                  <span>{tier.nextTier.pointsNeeded} للـ{tier.nextTier.name}</span>
                </div>
                <div className="bg-white/15 rounded-full h-2 overflow-hidden">
                  {(() => {
                    const currentMin = TIERS.find(t => t.level === tier.level)!.minPoints;
                    const nextMin = currentMin + tier.nextTier!.pointsNeeded + (totalEarned - currentMin);
                    const progress = ((totalEarned - currentMin) / (nextMin - currentMin)) * 100;
                    return <div className="h-full bg-white/80 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />;
                  })()}
                </div>
              </div>
            )}

            {canRedeem && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/90 bg-white/10 rounded-lg px-3 py-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5" /> قابلة للاستبدال
              </div>
            )}
          </div>
        </div>

        {/* Tier Badges */}
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
          {TIERS.map(t => (
            <div key={t.level} className={`shrink-0 rounded-2xl px-4 py-3 text-center transition-all ${
              tier.level === t.level 
                ? 'bg-primary/10 border-2 border-primary shadow-sm scale-105' 
                : 'bg-white dark:bg-card border border-border/20'
            }`}>
              <span className="text-xl">{t.icon}</span>
              <p className="text-[10px] font-bold text-foreground mt-1">{t.name}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-br from-primary to-primary/85 text-white rounded-2xl p-5 text-center font-semibold text-sm active:scale-[0.97] transition-all shadow-lg shadow-primary/20 flex flex-col items-center gap-2.5"
          >
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            تصفح القائمة
          </button>
          <button
            onClick={() => navigate('/reservation')}
            className="bg-gradient-to-br from-secondary to-secondary/85 text-secondary-foreground rounded-2xl p-5 text-center font-semibold text-sm active:scale-[0.97] transition-all shadow-lg shadow-secondary/20 flex flex-col items-center gap-2.5"
          >
            <div className="w-11 h-11 bg-black/10 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            حجز طاولة
          </button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;

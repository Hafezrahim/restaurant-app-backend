import React from 'react';
import { ShoppingBag, Heart, Clock, TrendingUp, Star, ChevronLeft, Utensils, CalendarDays } from 'lucide-react';
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
    { icon: ShoppingBag, label: 'إجمالي الطلبات', value: orders.length, color: 'bg-primary/10 text-primary', link: '/client/orders' },
    { icon: Heart, label: 'المفضلة', value: favorites.length, color: 'bg-secondary/10 text-secondary', link: '/client/wishlist' },
    { icon: Clock, label: 'طلبات نشطة', value: activeOrders.length, color: 'bg-accent/10 text-accent', link: '/client/orders' },
    { icon: TrendingUp, label: 'إجمالي المصروف', value: formatPrice(totalSpent.toFixed(0)), color: 'bg-destructive/10 text-destructive', link: '/client/orders' },
  ];

  return (
    <ClientLayout title="لوحة التحكم">
      <div className="space-y-5">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-secondary/5 rounded-2xl p-6 border border-border/30 relative overflow-hidden">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/5 rounded-full" />
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-secondary/5 rounded-full" />
          <div className="relative">
            <p className="text-sm text-muted-foreground mb-1">مرحباً بعودتك</p>
            <h2 className="text-2xl font-bold text-foreground">{user?.name} 👋</h2>
            <p className="text-sm text-muted-foreground mt-1">إليك ملخص حسابك اليوم</p>
          </div>
        </div>

        {/* Active Orders Banner */}
        {activeOrders.length > 0 && (
          <button
            onClick={() => navigate('/client/orders')}
            className="w-full bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center gap-3 hover:bg-accent/15 transition-colors text-right"
          >
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">لديك {activeOrders.length} طلب نشط</p>
              <p className="text-xs text-muted-foreground truncate">
                {activeOrders[0]?.trackingNumber} - {activeOrders[0]?.items?.[0]?.name || 'طلب جاري'}
              </p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        )}

        {/* Rewards Card */}
        <div className={`bg-gradient-to-br ${tier.color} rounded-2xl p-5 text-white relative overflow-hidden`}>
          <div className="absolute -top-4 -left-4 text-7xl opacity-10">{tier.icon}</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {tier.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{tier.name}</h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">×{tier.multiplier}</span>
              </div>
              <p className="text-xs text-white/70">{totalEarned} نقطة مكتسبة</p>
            </div>
            <div className="text-left">
              <p className="text-3xl font-bold">{points}</p>
              <p className="text-[10px] text-white/70">{formatPrice(pointsValue.toFixed(0))}</p>
            </div>
          </div>

          {tier.nextTier && (
            <div>
              <div className="flex justify-between text-[10px] text-white/70 mb-1">
                <span>{tier.name}</span>
                <span>{tier.nextTier.pointsNeeded} للـ{tier.nextTier.name}</span>
              </div>
              <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                {(() => {
                  const currentMin = TIERS.find(t => t.level === tier.level)!.minPoints;
                  const nextMin = currentMin + tier.nextTier!.pointsNeeded + (totalEarned - currentMin);
                  const progress = ((totalEarned - currentMin) / (nextMin - currentMin)) * 100;
                  return <div className="h-full bg-white/80 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />;
                })()}
              </div>
            </div>
          )}

          {canRedeem && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-white/90">
              <Star className="w-3 h-3" /> قابلة للاستبدال
            </div>
          )}
        </div>

        {/* Tier Badges */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {TIERS.map(t => (
            <div key={t.level} className={`shrink-0 rounded-xl px-3 py-2.5 text-center border transition-all ${
              tier.level === t.level ? 'border-primary bg-primary/5 shadow-sm' : 'border-border/50 bg-card'
            }`}>
              <span className="text-lg">{t.icon}</span>
              <p className="text-[10px] font-bold text-foreground mt-0.5">{t.name}</p>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <button
              key={i}
              onClick={() => navigate(s.link)}
              className="bg-card rounded-2xl p-4 text-right border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all active:scale-[0.97] group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="bg-primary text-primary-foreground rounded-2xl p-4 text-center font-semibold text-sm active:scale-[0.97] transition-transform flex flex-col items-center gap-2"
          >
            <Utensils className="w-5 h-5" />
            تصفح القائمة
          </button>
          <button
            onClick={() => navigate('/reservation')}
            className="bg-secondary text-secondary-foreground rounded-2xl p-4 text-center font-semibold text-sm active:scale-[0.97] transition-transform flex flex-col items-center gap-2"
          >
            <CalendarDays className="w-5 h-5" />
            حجز طاولة
          </button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;

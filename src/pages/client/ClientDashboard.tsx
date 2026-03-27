import React from 'react';
import { ShoppingBag, Heart, Clock, TrendingUp, Star, ChevronLeft, ArrowUpLeft } from 'lucide-react';
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

  const stats = [
    { icon: ShoppingBag, label: 'الطلبات', value: orders.length, color: 'from-primary/20 to-primary/5 text-primary', link: '/client/orders' },
    { icon: Heart, label: 'المفضلة', value: favorites.length, color: 'from-secondary/20 to-secondary/5 text-secondary', link: '/client/wishlist' },
    { icon: Clock, label: 'قيد التجهيز', value: orders.filter((o: any) => o.status !== 'delivered').length, color: 'from-accent/20 to-accent/5 text-accent', link: '/client/orders' },
    { icon: TrendingUp, label: 'المصروف', value: formatPrice(orders.reduce((s: number, o: any) => s + (o.total || 0), 0).toFixed(0)), color: 'from-destructive/20 to-destructive/5 text-destructive', link: '/client/orders' },
  ];

  return (
    <ClientLayout title="لوحة التحكم">
      <div className="space-y-4">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-primary/10 via-card to-secondary/5 rounded-2xl p-5 border border-border/30">
          <h2 className="text-xl font-bold text-foreground mb-0.5">مرحباً {user?.name} 👋</h2>
          <p className="text-sm text-muted-foreground">إليك ملخص حسابك</p>
        </div>

        {/* Rewards Card - Compact */}
        <div className={`bg-gradient-to-br ${tier.color} rounded-2xl p-4 text-white relative overflow-hidden`}>
          <div className="absolute -top-4 -left-4 text-7xl opacity-10">{tier.icon}</div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              {tier.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{tier.name}</h3>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">×{tier.multiplier}</span>
              </div>
              <p className="text-xs text-white/70">{totalEarned} نقطة مكتسبة</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold">{points}</p>
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
                  return <div className="h-full bg-white/80 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />;
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
            <div key={t.level} className={`shrink-0 rounded-xl px-3 py-2 text-center border ${
              tier.level === t.level ? 'border-primary bg-primary/5' : 'border-border/50 bg-card'
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
              className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-right transition-transform active:scale-95`}
            >
              <s.icon className="w-5 h-5 mb-2" />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="bg-primary text-primary-foreground rounded-2xl p-4 text-center font-semibold text-sm active:scale-95 transition-transform"
          >
            🍽️ تصفح القائمة
          </button>
          <button
            onClick={() => navigate('/reservation')}
            className="bg-secondary text-secondary-foreground rounded-2xl p-4 text-center font-semibold text-sm active:scale-95 transition-transform"
          >
            📅 حجز طاولة
          </button>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;

import React from 'react';
import { ShoppingBag, Heart, Clock, TrendingUp, Gift, Star, Award } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useClientAuth } from '@/context/ClientAuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useRewards, MIN_REDEEM, SAR_PER_POINT, TIERS } from '@/context/RewardsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Helmet } from 'react-helmet-async';

const ClientDashboard: React.FC = () => {
  const { user } = useClientAuth();
  const { favorites } = useFavorites();
  const { points, pointsValue, canRedeem, tier, totalEarned } = useRewards();
  const { formatPrice } = useCurrency();

  const orders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');

  const stats = [
    { icon: ShoppingBag, label: 'إجمالي الطلبات', value: orders.length, color: 'bg-primary/10 text-primary' },
    { icon: Heart, label: 'المفضلة', value: favorites.length, color: 'bg-secondary/10 text-secondary' },
    { icon: Clock, label: 'قيد التجهيز', value: orders.filter((o: any) => o.status !== 'delivered').length, color: 'bg-accent/10 text-accent' },
    { icon: TrendingUp, label: 'إجمالي المصروف', value: formatPrice(orders.reduce((s: number, o: any) => s + (o.total || 0), 0).toFixed(0)), color: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <>
      <Helmet><title>لوحة التحكم - مطعم مزاج</title></Helmet>
      <ClientLayout title="لوحة التحكم">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="text-xl font-bold text-foreground mb-1">مرحباً {user?.name} 👋</h2>
            <p className="text-muted-foreground text-sm">إليك ملخص حسابك</p>
          </div>

          {/* Tier & Rewards Card */}
          <div className={`bg-gradient-to-br ${tier.color} rounded-2xl p-5 shadow-card text-white relative overflow-hidden`}>
            <div className="absolute top-2 left-2 text-5xl opacity-20">{tier.icon}</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                {tier.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">مستوى {tier.name}</h3>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">×{tier.multiplier} نقاط</span>
                </div>
                <p className="text-xs text-white/80">إجمالي المكتسب: {totalEarned} نقطة</p>
              </div>
            </div>

            {/* Tier progress */}
            {tier.nextTier && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>{tier.name}</span>
                  <span>{tier.nextTier.name} ({tier.nextTier.pointsNeeded} نقطة متبقية)</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  {(() => {
                    const currentMin = TIERS.find(t => t.level === tier.level)!.minPoints;
                    const nextMin = currentMin + tier.nextTier.pointsNeeded + (totalEarned - currentMin);
                    const progress = ((totalEarned - currentMin) / (nextMin - currentMin)) * 100;
                    return (
                      <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{points}</p>
                <p className="text-xs text-white/80">نقطة ({formatPrice(pointsValue.toFixed(1))})</p>
              </div>
              {canRedeem ? (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star className="w-3 h-3" />
                  قابلة للاستبدال
                </span>
              ) : (
                <span className="text-xs text-white/70">
                  تحتاج {MIN_REDEEM - points > 0 ? MIN_REDEEM - points : 0} نقطة إضافية
                </span>
              )}
            </div>
          </div>

          {/* All Tiers */}
          <div className="grid grid-cols-3 gap-3">
            {TIERS.map(t => (
              <div key={t.level} className={`rounded-xl p-3 text-center border ${tier.level === t.level ? 'border-primary bg-primary/5 shadow-card' : 'border-border bg-card'}`}>
                <span className="text-2xl">{t.icon}</span>
                <p className="text-sm font-bold text-foreground mt-1">{t.name}</p>
                <p className="text-xs text-muted-foreground">×{t.multiplier} نقاط</p>
                <p className="text-[10px] text-muted-foreground">{t.minPoints}+ نقطة</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </ClientLayout>
    </>
  );
};

export default ClientDashboard;

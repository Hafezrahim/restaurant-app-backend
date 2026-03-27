import React from 'react';
import { Gift, TrendingUp, TrendingDown, Star, Clock, Award } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useRewards, MIN_REDEEM, SAR_PER_POINT, TIERS, RewardTransaction } from '@/context/RewardsContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Helmet } from 'react-helmet-async';

const ClientRewards: React.FC = () => {
  const { points, pointsValue, canRedeem, transactions, tier, totalEarned } = useRewards();
  const { formatPrice, currency } = useCurrency();

  const totalEarnedPts = transactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.points, 0);
  const totalRedeemed = transactions.filter(t => t.type === 'redeem').reduce((s, t) => s + t.points, 0);

  return (
    <>
      <Helmet><title>نقاط المكافآت - مطعم مزاج</title></Helmet>
      <ClientLayout title="نقاط المكافآت">
        <div className="space-y-6">
          {/* Tier Card */}
          <div className={`bg-gradient-to-br ${tier.color} rounded-2xl p-6 shadow-card text-white relative overflow-hidden`}>
            <div className="absolute top-2 left-2 text-6xl opacity-15">{tier.icon}</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                {tier.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xl">مستوى {tier.name}</h2>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">×{tier.multiplier} نقاط</span>
                </div>
                <p className="text-sm text-white/80">كل 1 {currency.symbol} = {tier.multiplier} نقطة</p>
              </div>
            </div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-4xl font-bold">{points}</p>
                <p className="text-sm text-white/80">نقطة ({formatPrice(pointsValue.toFixed(1))})</p>
              </div>
              {canRedeem ? (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star className="w-3 h-3" />
                  قابلة للاستبدال
                </span>
              ) : (
                <span className="text-xs text-white/70">
                  تحتاج {Math.max(MIN_REDEEM - points, 0)} نقطة إضافية
                </span>
              )}
            </div>
            {tier.nextTier && (
              <div>
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>{tier.name}</span>
                  <span>{tier.nextTier.name} ({tier.nextTier.pointsNeeded} نقطة متبقية)</span>
                </div>
                <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
                  {(() => {
                    const currentMin = TIERS.find(t => t.level === tier.level)!.minPoints;
                    const nextMin = currentMin + tier.nextTier!.pointsNeeded + (totalEarned - currentMin);
                    const progress = ((totalEarned - currentMin) / (nextMin - currentMin)) * 100;
                    return <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />;
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Tiers Overview */}
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

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalEarnedPts}</p>
              <p className="text-xs text-muted-foreground">إجمالي المكتسب</p>
            </div>
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalRedeemed}</p>
              <p className="text-xs text-muted-foreground">إجمالي المستبدل</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                سجل العمليات
              </h3>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-1">لا توجد عمليات بعد</p>
                <p className="text-sm text-muted-foreground">ستظهر نقاطك المكتسبة والمستبدلة هنا</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((txn) => (
                  <div key={txn.id} className="p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      txn.type === 'earn' ? 'bg-green-500/10' : 'bg-destructive/10'
                    }`}>
                      {txn.type === 'earn' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{txn.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(txn.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${
                      txn.type === 'earn' ? 'text-green-500' : 'text-destructive'
                    }`}>
                      {txn.type === 'earn' ? '+' : '-'}{txn.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ClientLayout>
    </>
  );
};

export default ClientRewards;

import React from 'react';
import { Gift, TrendingUp, TrendingDown, Star, Clock, Sparkles } from 'lucide-react';
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
        <div className="space-y-5">
          {/* Tier Card */}
          <div className={`bg-gradient-to-br ${tier.color} rounded-2xl p-6 text-white relative overflow-hidden shadow-xl`}>
            <div className="absolute top-2 left-2 text-7xl opacity-10">{tier.icon}</div>
            <div className="absolute bottom-1 right-1 text-5xl opacity-5 rotate-12">{tier.icon}</div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  {tier.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">مستوى {tier.name}</h2>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">×{tier.multiplier} نقاط</span>
                  </div>
                  <p className="text-xs text-white/60">كل 1 {currency.symbol} = {tier.multiplier} نقطة</p>
                </div>
              </div>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-4xl font-bold leading-none">{points}</p>
                  <p className="text-sm text-white/70 mt-1">نقطة ({formatPrice(pointsValue.toFixed(1))})</p>
                </div>
                {canRedeem ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5" />
                    قابلة للاستبدال
                  </span>
                ) : (
                  <span className="text-xs text-white/60 bg-white/10 px-3 py-1.5 rounded-lg">
                    تحتاج {Math.max(MIN_REDEEM - points, 0)} نقطة إضافية
                  </span>
                )}
              </div>
              {tier.nextTier && (
                <div>
                  <div className="flex justify-between text-[10px] text-white/60 mb-1.5">
                    <span>{tier.name}</span>
                    <span>{tier.nextTier.name} ({tier.nextTier.pointsNeeded} نقطة متبقية)</span>
                  </div>
                  <div className="bg-white/15 rounded-full h-2.5 overflow-hidden">
                    {(() => {
                      const currentMin = TIERS.find(t => t.level === tier.level)!.minPoints;
                      const nextMin = currentMin + tier.nextTier!.pointsNeeded + (totalEarned - currentMin);
                      const progress = ((totalEarned - currentMin) / (nextMin - currentMin)) * 100;
                      return <div className="h-full bg-white/70 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tiers Overview */}
          <div className="grid grid-cols-3 gap-2.5">
            {TIERS.map(t => (
              <div key={t.level} className={`rounded-2xl p-3.5 text-center transition-all ${
                tier.level === t.level 
                  ? 'bg-primary/10 border-2 border-primary shadow-md scale-[1.03]' 
                  : 'bg-white dark:bg-card border border-border/15'
              }`}>
                <span className="text-2xl">{t.icon}</span>
                <p className="text-xs font-bold text-foreground mt-1">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">×{t.multiplier}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{t.minPoints}+ نقطة</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-card rounded-2xl p-4 border border-border/15 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 bg-emerald-100 dark:bg-emerald-500/15">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalEarnedPts}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">إجمالي المكتسب</p>
            </div>
            <div className="bg-white dark:bg-card rounded-2xl p-4 border border-border/15 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <p className="text-xl font-bold text-foreground">{totalRedeemed}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">إجمالي المستبدل</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white dark:bg-card rounded-2xl border border-border/15 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/15 bg-muted/20">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                سجل العمليات
              </h3>
            </div>

            {transactions.length === 0 ? (
              <div className="p-10 text-center">
                <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-bold text-foreground mb-1">لا توجد عمليات بعد</p>
                <p className="text-sm text-muted-foreground">ستظهر نقاطك المكتسبة والمستبدلة هنا</p>
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {transactions.map((txn) => (
                  <div key={txn.id} className="p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      txn.type === 'earn' ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-destructive/10'
                    }`}>
                      {txn.type === 'earn' ? (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{txn.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(txn.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 px-2.5 py-1 rounded-lg ${
                      txn.type === 'earn' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15' : 'text-destructive bg-destructive/10'
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

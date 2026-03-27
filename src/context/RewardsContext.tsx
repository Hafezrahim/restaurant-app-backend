import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useClientAuth } from './ClientAuthContext';

export interface RewardTransaction {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  date: string;
  orderNumber?: string;
}

export type TierLevel = 'bronze' | 'silver' | 'gold';

export interface TierInfo {
  level: TierLevel;
  name: string;
  multiplier: number;
  minPoints: number;
  color: string;
  icon: string;
  nextTier?: { name: string; pointsNeeded: number };
}

const TIERS: Omit<TierInfo, 'nextTier'>[] = [
  { level: 'bronze', name: 'برونز', multiplier: 1, minPoints: 0, color: 'from-amber-700 to-amber-500', icon: '🥉' },
  { level: 'silver', name: 'فضي', multiplier: 1.5, minPoints: 500, color: 'from-slate-400 to-slate-300', icon: '🥈' },
  { level: 'gold', name: 'ذهبي', multiplier: 2, minPoints: 1500, color: 'from-yellow-500 to-amber-400', icon: '🥇' },
];

export function getTierInfo(totalEarned: number): TierInfo {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (totalEarned >= tier.minPoints) current = tier;
  }
  const idx = TIERS.indexOf(current);
  const next = idx < TIERS.length - 1 ? TIERS[idx + 1] : undefined;
  return {
    ...current,
    nextTier: next ? { name: next.name, pointsNeeded: next.minPoints - totalEarned } : undefined,
  };
}

interface RewardsContextType {
  points: number;
  transactions: RewardTransaction[];
  addPoints: (amount: number, orderNumber?: string) => void;
  redeemPoints: (points: number) => number;
  canRedeem: boolean;
  pointsValue: number;
  tier: TierInfo;
  totalEarned: number;
}

const REWARDS_KEY = 'mazaj_rewards';
const REWARDS_HISTORY_KEY = 'mazaj_rewards_history';
const TOTAL_EARNED_KEY = 'mazaj_total_earned';
const POINTS_PER_SAR = 1;
const SAR_PER_POINT = 0.1;
const MIN_REDEEM = 50;

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const RewardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useClientAuth();

  const getStored = (key: string) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  };

  const [points, setPoints] = useState<number>(() => {
    if (!user) return 0;
    return getStored(REWARDS_KEY)[user.id] || 0;
  });

  const [transactions, setTransactions] = useState<RewardTransaction[]>(() => {
    if (!user) return [];
    return getStored(REWARDS_HISTORY_KEY)[user.id] || [];
  });

  const [totalEarned, setTotalEarned] = useState<number>(() => {
    if (!user) return 0;
    return getStored(TOTAL_EARNED_KEY)[user.id] || 0;
  });

  useEffect(() => {
    if (user) {
      setPoints(getStored(REWARDS_KEY)[user.id] || 0);
      setTransactions(getStored(REWARDS_HISTORY_KEY)[user.id] || []);
      setTotalEarned(getStored(TOTAL_EARNED_KEY)[user.id] || 0);
    } else {
      setPoints(0);
      setTransactions([]);
      setTotalEarned(0);
    }
  }, [user]);

  const save = (key: string, userId: string, value: any) => {
    const all = getStored(key);
    all[userId] = value;
    localStorage.setItem(key, JSON.stringify(all));
  };

  const addTransaction = (txn: RewardTransaction) => {
    if (!user) return;
    setTransactions(prev => {
      const updated = [txn, ...prev].slice(0, 100);
      save(REWARDS_HISTORY_KEY, user.id, updated);
      return updated;
    });
  };

  const tier = getTierInfo(totalEarned);

  const addPoints = useCallback((orderTotal: number, orderNumber?: string) => {
    if (!user) return;
    const currentTier = getTierInfo(getStored(TOTAL_EARNED_KEY)[user.id] || 0);
    const earned = Math.floor(orderTotal * POINTS_PER_SAR * currentTier.multiplier);
    setPoints(prev => {
      const updated = prev + earned;
      save(REWARDS_KEY, user.id, updated);
      return updated;
    });
    setTotalEarned(prev => {
      const updated = prev + earned;
      save(TOTAL_EARNED_KEY, user.id, updated);
      return updated;
    });
    const multiplierText = currentTier.multiplier > 1 ? ` (×${currentTier.multiplier} ${currentTier.name})` : '';
    addTransaction({
      id: Date.now().toString(36),
      type: 'earn',
      points: earned,
      description: orderNumber ? `نقاط من الطلب ${orderNumber}${multiplierText}` : `نقاط مكتسبة${multiplierText}`,
      date: new Date().toISOString(),
      orderNumber,
    });
  }, [user]);

  const redeemPoints = useCallback((pts: number): number => {
    if (!user || pts < MIN_REDEEM || pts > points) return 0;
    const discount = pts * SAR_PER_POINT;
    setPoints(prev => {
      const updated = prev - pts;
      save(REWARDS_KEY, user.id, updated);
      return updated;
    });
    addTransaction({
      id: Date.now().toString(36),
      type: 'redeem',
      points: pts,
      description: `استبدال ${pts} نقطة بخصم ${discount.toFixed(1)}`,
      date: new Date().toISOString(),
    });
    return discount;
  }, [user, points]);

  return (
    <RewardsContext.Provider value={{
      points,
      transactions,
      addPoints,
      redeemPoints,
      canRedeem: points >= MIN_REDEEM,
      pointsValue: points * SAR_PER_POINT,
      tier,
      totalEarned,
    }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) throw new Error('useRewards must be used within RewardsProvider');
  return context;
};

export { MIN_REDEEM, SAR_PER_POINT, TIERS };

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  for (const tier of TIERS) if (totalEarned >= tier.minPoints) current = tier;
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
  /** Schedule local redemption flag — actual deduction is server-side at checkout. */
  redeemPoints: (points: number) => number;
  canRedeem: boolean;
  pointsValue: number;
  tier: TierInfo;
  totalEarned: number;
  refresh: () => void;
}

const SAR_PER_POINT = 0.1;
const MIN_REDEEM = 50;

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const RewardsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useClientAuth();
  const qc = useQueryClient();

  // Source of truth is now the `rewards` table (SELECT scoped to auth.uid()).
  // Sum positive entries for "total earned" and net sum for current balance.
  const { data } = useQuery({
    queryKey: ['rewards', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('rewards')
        .select('id, points, reason, order_id, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return rows ?? [];
    },
    staleTime: 30_000,
  });

  const [redeemFlag, setRedeemFlag] = useState(false);

  useEffect(() => { setRedeemFlag(false); }, [user?.id]);

  const rows = data ?? [];
  const points = rows.reduce((s, r) => s + (r.points ?? 0), 0);
  const totalEarned = rows.filter((r) => (r.points ?? 0) > 0).reduce((s, r) => s + r.points, 0);

  const transactions: RewardTransaction[] = rows.map((r) => ({
    id: r.id,
    type: r.points >= 0 ? 'earn' : 'redeem',
    points: Math.abs(r.points),
    description: r.reason || '',
    date: r.created_at,
    orderNumber: r.order_id ?? undefined,
  }));

  const tier = getTierInfo(totalEarned);

  const redeemPoints = useCallback((pts: number): number => {
    if (pts < MIN_REDEEM || pts > points) return 0;
    setRedeemFlag(true);
    return pts * SAR_PER_POINT;
  }, [points]);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['rewards', user?.id] });
  }, [qc, user?.id]);

  return (
    <RewardsContext.Provider value={{
      points,
      transactions,
      redeemPoints,
      canRedeem: points >= MIN_REDEEM,
      pointsValue: points * SAR_PER_POINT,
      tier,
      totalEarned,
      refresh,
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

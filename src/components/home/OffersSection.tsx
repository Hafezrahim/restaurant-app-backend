import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { Tag, Copy, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const OffersSection: React.FC = () => {
  const { formatPrice } = useCurrency();

  const { data: coupons = [] } = useQuery({
    queryKey: ['activeCoupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (coupons.length === 0) return null;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ كود الخصم!');
  };

  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">🎁 العروض الحصرية</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 rounded-2xl p-4 border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-primary">
                    {coupon.type === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                  </span>
                  <span className="text-xs text-muted-foreground">خصم</span>
                </div>
                <p className="text-sm text-foreground font-medium line-clamp-1">{coupon.description}</p>
                {coupon.min_order > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    حد أدنى {formatPrice(coupon.min_order)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <button
                onClick={() => copyCode(coupon.code)}
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Copy className="w-3 h-3" />
                {coupon.code}
              </button>
              {coupon.expires_at && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(coupon.expires_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

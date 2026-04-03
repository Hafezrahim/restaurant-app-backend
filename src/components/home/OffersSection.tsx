import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { Tag, Copy, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AVAILABLE_COUPONS } from '@/data/coupons';
import useEmblaCarousel from 'embla-carousel-react';

const AUTOPLAY_INTERVAL = 4000;

const fallbackCoupons = AVAILABLE_COUPONS.map((coupon, index) => ({
  id: `fallback-${coupon.code}-${index}`,
  code: coupon.code,
  type: coupon.type,
  value: coupon.value,
  min_order: coupon.minOrder,
  description: coupon.description,
  expires_at: coupon.expiresAt,
}));

export const OffersSection: React.FC = () => {
  const { formatPrice } = useCurrency();
  const autoplayRef = useRef<ReturnType<typeof setInterval>>();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: 'rtl', align: 'start', loop: true,
    slidesToScroll: 1, containScroll: 'trimSnaps',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: coupons = [] } = useQuery({
    queryKey: ['activeCoupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons').select('*').eq('is_active', true)
        .order('created_at', { ascending: false }).limit(6);
      if (error || !data?.length) return fallbackCoupons;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => { emblaApi?.scrollNext(); }, AUTOPLAY_INTERVAL);
  }, [emblaApi]);

  const stopAutoplay = () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', stopAutoplay);
    emblaApi.on('pointerUp', startAutoplay);
    startAutoplay();
    return () => {
      stopAutoplay();
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', stopAutoplay);
      emblaApi.off('pointerUp', startAutoplay);
    };
  }, [emblaApi, onSelect, startAutoplay]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('تم نسخ كود الخصم!');
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-bold text-foreground">🎁 العروض الحصرية</h3>
        <div className="hidden md:flex items-center gap-1.5">
          <button onClick={() => emblaApi?.scrollPrev()}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={() => emblaApi?.scrollNext()}
            className="w-8 h-8 rounded-full bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {coupons.map((coupon, idx) => (
            <div key={coupon.id} className="flex-[0_0_85%] min-w-0 sm:flex-[0_0_48%] lg:flex-[0_0_32%] transition-all duration-500"
              style={{
                opacity: emblaApi ? 1 : 0,
                transform: emblaApi ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
                transitionDelay: `${idx * 80}ms`,
              }}>
              <div className="bg-gradient-to-br from-primary/5 via-card to-secondary/5 rounded-2xl p-4 border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group h-full">
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
                      <p className="text-[11px] text-muted-foreground mt-0.5">حد أدنى {formatPrice(coupon.min_order)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <button onClick={() => copyCode(coupon.code)}
                    className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-colors">
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
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {coupons.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 md:hidden">
          {coupons.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${selectedIndex === i ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`} />
          ))}
        </div>
      )}
    </section>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, MessageSquareQuote } from 'lucide-react';

const fallbackReviews = [
  {
    id: 'fallback-review-1',
    reviewer_name: 'أحمد محمد',
    rating: 5,
    comment: 'أفضل مطعم جربته! الأكل لذيذ جداً والخدمة ممتازة.',
    created_at: '2026-03-28T00:00:00.000Z',
  },
  {
    id: 'fallback-review-2',
    reviewer_name: 'سارة علي',
    rating: 5,
    comment: 'المشاوي رائعة والتوصيل سريع، أنصح الجميع بالتجربة.',
    created_at: '2026-03-27T00:00:00.000Z',
  },
  {
    id: 'fallback-review-3',
    reviewer_name: 'خالد العمري',
    rating: 4,
    comment: 'طعام ممتاز وأسعار معقولة، سأطلب مرة أخرى بالتأكيد.',
    created_at: '2026-03-26T00:00:00.000Z',
  },
];

export const TestimonialsSection: React.FC = () => {
  const { data: reviews = [] } = useQuery({
    queryKey: ['approvedReviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .gte('rating', 4)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error || !data?.length) return fallbackReviews;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">⭐ آراء عملائنا</h3>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="min-w-[260px] max-w-[300px] snap-start bg-card rounded-2xl p-4 shadow-card border border-border/30 shrink-0"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {review.reviewer_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{review.reviewer_name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < review.rating ? 'text-secondary fill-secondary' : 'text-muted-foreground/30'}`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <div className="relative">
                <MessageSquareQuote className="absolute top-0 right-0 w-4 h-4 text-primary/15" />
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pr-5">
                  {review.comment}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

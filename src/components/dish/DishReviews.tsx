import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  liked?: boolean;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'أحمد محمد',
    avatar: '👨‍💼',
    rating: 5,
    comment: 'طبق رائع! النكهة مميزة والتقديم أنيق جداً. أنصح الجميع بتجربته.',
    date: 'منذ يومين',
    likes: 12,
  },
  {
    id: '2',
    userName: 'سارة علي',
    avatar: '👩‍💻',
    rating: 4,
    comment: 'لذيذ جداً، الكمية مناسبة والطعم ممتاز. سأطلبه مرة أخرى بالتأكيد.',
    date: 'منذ أسبوع',
    likes: 8,
  },
  {
    id: '3',
    userName: 'خالد العمري',
    avatar: '👨‍🍳',
    rating: 5,
    comment: 'أفضل طبق جربته في المطعم. المكونات طازجة والتتبيلة مثالية.',
    date: 'منذ أسبوعين',
    likes: 5,
  },
];

interface DishReviewsProps {
  dishId: string;
  dishRating: number;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md'; interactive?: boolean; onChange?: (r: number) => void }> = ({
  rating,
  size = 'sm',
  interactive = false,
  onChange,
}) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(interactive && 'cursor-pointer hover:scale-110 transition-transform')}
        >
          <Star
            className={cn(
              sizeClass,
              star <= rating ? 'fill-secondary text-secondary' : 'text-border'
            )}
          />
        </button>
      ))}
    </div>
  );
};

export const DishReviews: React.FC<DishReviewsProps> = ({ dishId, dishRating }) => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const avgRating = dishRating;
  const totalReviews = reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (r) => reviews.filter((rev) => rev.rating === r).length
  );

  const handleLike = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, likes: r.liked ? r.likes - 1 : r.likes + 1, liked: !r.liked }
          : r
      )
    );
  };

  const handleSubmit = () => {
    if (newRating === 0) {
      toast({ title: 'يرجى اختيار تقييم', variant: 'destructive' });
      return;
    }
    if (!newComment.trim()) {
      toast({ title: 'يرجى كتابة تعليق', variant: 'destructive' });
      return;
    }
    const newReview: Review = {
      id: Date.now().toString(),
      userName: 'أنت',
      avatar: '😊',
      rating: newRating,
      comment: newComment,
      date: 'الآن',
      likes: 0,
    };
    setReviews((prev) => [newReview, ...prev]);
    setNewRating(0);
    setNewComment('');
    setShowForm(false);
    toast({ title: 'شكراً لتقييمك!', description: 'تم إضافة تقييمك بنجاح' });
  };

  return (
    <div className="animate-fade-in">
      {/* Summary */}
      <div className="flex items-start gap-8 mb-8">
        <div className="text-center">
          <p className="text-5xl font-bold text-foreground">{avgRating}</p>
          <StarRating rating={Math.round(avgRating)} size="md" />
          <p className="text-sm text-muted-foreground mt-1">{totalReviews} تقييم</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-4">{star}</span>
              <Star className="w-3 h-3 fill-secondary text-secondary" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full transition-all duration-500"
                  style={{ width: `${totalReviews ? (ratingCounts[i] / totalReviews) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-6 text-left">{ratingCounts[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Button */}
      {!showForm && (
        <Button
          variant="outline"
          className="w-full rounded-xl mb-6 gap-2"
          onClick={() => setShowForm(true)}
        >
          <MessageCircle className="w-4 h-4" />
          أضف تقييمك
        </Button>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="bg-muted/50 rounded-2xl p-4 mb-6 animate-scale-in border border-border/50">
          <h4 className="font-semibold text-foreground mb-3">أضف تقييمك</h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">تقييمك:</span>
            <StarRating rating={newRating} size="md" interactive onChange={setNewRating} />
          </div>
          <Textarea
            placeholder="شاركنا رأيك عن هذا الطبق..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3 rounded-xl resize-none bg-background"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              إلغاء
            </Button>
            <Button size="sm" className="btn-primary rounded-full px-6" onClick={handleSubmit}>
              إرسال
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className="bg-card border border-border/50 rounded-2xl p-4 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{review.avatar}</span>
                <div>
                  <p className="font-semibold text-foreground text-sm">{review.userName}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-foreground text-sm leading-relaxed mb-3">{review.comment}</p>
            <button
              onClick={() => handleLike(review.id)}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                review.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <ThumbsUp className={cn('w-3.5 h-3.5', review.liked && 'fill-current')} />
              <span>{review.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

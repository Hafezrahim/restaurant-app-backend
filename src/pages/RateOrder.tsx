import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, ThumbsUp, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const ratingLabels = ['سيء جداً', 'سيء', 'مقبول', 'جيد', 'ممتاز'];

const quickFeedback = [
  { id: 'fast', label: 'توصيل سريع', icon: '🚀' },
  { id: 'tasty', label: 'طعم لذيذ', icon: '😋' },
  { id: 'hot', label: 'ساخن', icon: '🔥' },
  { id: 'fresh', label: 'طازج', icon: '🥗' },
  { id: 'packaging', label: 'تغليف ممتاز', icon: '📦' },
  { id: 'driver', label: 'سائق محترم', icon: '👍' },
];

const RateOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const trackingNumber = searchParams.get('order') || 'MZJ-XXXXX';
  
  const [foodRating, setFoodRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [hoveredFood, setHoveredFood] = useState(0);
  const [hoveredDelivery, setHoveredDelivery] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleFeedback = (id: string) => {
    setSelectedFeedback((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (foodRating === 0) {
      toast.error('يرجى تقييم الطعام');
      return;
    }
    
    // Simulate submission
    setSubmitted(true);
    toast.success('شكراً لك على تقييمك!');
  };

  const StarRating = ({
    rating,
    hovered,
    onRate,
    onHover,
    onLeave,
  }: {
    rating: number;
    hovered: number;
    onRate: (n: number) => void;
    onHover: (n: number) => void;
    onLeave: () => void;
  }) => (
    <div className="flex gap-1" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onRate(n)}
          onMouseEnter={() => onHover(n)}
          className="p-1 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`w-10 h-10 transition-colors ${
              n <= (hovered || rating)
                ? 'fill-secondary text-secondary'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>شكراً لتقييمك - مطعم مزاج</title>
        </Helmet>
        <AppLayout title="تم التقييم" showSearch={false}>
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center mb-6 animate-scale-in">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">شكراً لك!</h1>
            <p className="text-muted-foreground mb-8">
              تقييمك يساعدنا على تحسين خدماتنا
            </p>
            
            <div className="bg-card rounded-2xl p-6 shadow-card mb-6">
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-8 h-8 ${
                      n <= foodRating ? 'fill-secondary text-secondary' : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold text-foreground">
                {ratingLabels[foodRating - 1]}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/menu')}
                className="w-full btn-primary rounded-full"
                size="lg"
              >
                اطلب مرة أخرى
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full rounded-full"
                size="lg"
              >
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>تقييم الطلب - مطعم مزاج</title>
      </Helmet>
      <AppLayout title="قيّم طلبك" showSearch={false}>
        <div className="max-w-md mx-auto space-y-6">
          {/* Order Reference */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">طلب رقم</p>
            <p className="font-mono font-bold text-primary">{trackingNumber}</p>
          </div>

          {/* Food Rating */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-bold text-lg text-foreground mb-2 text-center">
              كيف كان الطعام؟
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {hoveredFood > 0 ? ratingLabels[hoveredFood - 1] : foodRating > 0 ? ratingLabels[foodRating - 1] : 'اختر تقييمك'}
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={foodRating}
                hovered={hoveredFood}
                onRate={setFoodRating}
                onHover={setHoveredFood}
                onLeave={() => setHoveredFood(0)}
              />
            </div>
          </div>

          {/* Delivery Rating */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-bold text-lg text-foreground mb-2 text-center">
              كيف كانت خدمة التوصيل؟
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {hoveredDelivery > 0 ? ratingLabels[hoveredDelivery - 1] : deliveryRating > 0 ? ratingLabels[deliveryRating - 1] : 'اختر تقييمك'}
            </p>
            <div className="flex justify-center">
              <StarRating
                rating={deliveryRating}
                hovered={hoveredDelivery}
                onRate={setDeliveryRating}
                onHover={setHoveredDelivery}
                onLeave={() => setHoveredDelivery(0)}
              />
            </div>
          </div>

          {/* Quick Feedback */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-primary" />
              ما الذي أعجبك؟
            </h2>
            <div className="flex flex-wrap gap-2">
              {quickFeedback.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleFeedback(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFeedback.includes(item.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  <span className="ml-1">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              أضف تعليقاً (اختياري)
            </h2>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا تجربتك..."
              className="rounded-xl resize-none"
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            className="w-full btn-primary rounded-full"
            size="lg"
          >
            <Send className="w-5 h-5 ml-2" />
            إرسال التقييم
          </Button>

          {/* Skip */}
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            تخطي
          </Button>
        </div>
      </AppLayout>
    </>
  );
};

export default RateOrder;

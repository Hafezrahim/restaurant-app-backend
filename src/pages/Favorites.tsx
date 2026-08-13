import React from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { FoodCard } from '@/components/menu/FoodCard';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { SeoLinks } from '@/components/seo/SeoLinks';

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>المفضلة - مطعم مزاج</title>
        <meta name="description" content="استعرض قائمة أطباقك المفضلة المحفوظة في مطعم مزاج وأعد طلبها بسرعة في أي وقت." />
        <meta property="og:title" content="المفضلة - مطعم مزاج" />
        <meta property="og:description" content="قائمة أطباقك المفضلة المحفوظة في مطعم مزاج لطلب سريع ومتكرر." />
      </Helmet>
      <SeoLinks path="/favorites" />
      <AppLayout title="المفضلة" showSearch={false}>
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">لا توجد مفضلات بعد</h2>
            <p className="text-muted-foreground text-sm mb-6">
              احفظ أطباقك المفضلة للوصول السريع
            </p>
            <Button onClick={() => navigate('/menu')} className="btn-primary rounded-full">
              تصفح القائمة
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((item, index) => (
              <div
                key={item.id}
                className="opacity-0 animate-slide-up"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'forwards',
                }}
              >
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        )}
      </AppLayout>
    </>
  );
};

export default Favorites;

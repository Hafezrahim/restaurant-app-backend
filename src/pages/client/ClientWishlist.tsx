import React from 'react';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { FoodCard } from '@/components/menu/FoodCard';
import { useFavorites } from '@/context/FavoritesContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ClientWishlist: React.FC = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  return (
    <ClientLayout title="المفضلة">
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary/15 to-secondary/5 flex items-center justify-center mb-5">
            <Heart className="w-10 h-10 text-secondary/40" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1">قائمة المفضلة فارغة</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-[260px] leading-relaxed">
            أضف أطباقك المفضلة من القائمة لتجدها هنا بسهولة
          </p>
          <Button onClick={() => navigate('/menu')} className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
            <ShoppingBag className="w-4 h-4 ml-2" />
            تصفح القائمة
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 bg-white dark:bg-card rounded-xl px-4 py-3 border border-border/15 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <p className="text-sm font-semibold text-foreground">{favorites.length} صنف في المفضلة</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {favorites.map(item => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </ClientLayout>
  );
};

export default ClientWishlist;

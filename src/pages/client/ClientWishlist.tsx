import React from 'react';
import { Heart } from 'lucide-react';
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
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1">لا توجد مفضلات</h3>
          <p className="text-sm text-muted-foreground mb-4">أضف أطباقك المفضلة من القائمة</p>
          <Button onClick={() => navigate('/menu')} className="btn-primary rounded-xl">
            تصفح القائمة
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {favorites.map(item => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </ClientLayout>
  );
};

export default ClientWishlist;

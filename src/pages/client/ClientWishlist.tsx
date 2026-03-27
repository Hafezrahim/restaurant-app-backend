import React from 'react';
import { Heart } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { FoodCard } from '@/components/menu/FoodCard';
import { useFavorites } from '@/context/FavoritesContext';
import { Helmet } from 'react-helmet-async';

const ClientWishlist: React.FC = () => {
  const { favorites } = useFavorites();

  return (
    <>
      <Helmet><title>المفضلة - مطعم مزاج</title></Helmet>
      <ClientLayout title="المفضلة">
        {favorites.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 shadow-card text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg text-foreground mb-2">لا توجد مفضلات</h3>
            <p className="text-sm text-muted-foreground">أضف أطباقك المفضلة من القائمة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map(item => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </ClientLayout>
    </>
  );
};

export default ClientWishlist;

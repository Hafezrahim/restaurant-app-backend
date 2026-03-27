import React from 'react';
import { useNavigate } from 'react-router-dom';
import { menuItems } from '@/data/menuData';
import { FoodCard } from '@/components/menu/FoodCard';

export const PopularItems: React.FC = () => {
  const navigate = useNavigate();
  const popularItems = menuItems.filter((item) => item.isPopular).slice(0, 4);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">الأطباق الأكثر طلباً</h3>
        <button 
          onClick={() => navigate('/menu')}
          className="text-sm text-primary font-medium hover:underline"
        >
          عرض الكل
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {popularItems.map((item, index) => (
          <div
            key={item.id}
            className="opacity-0 animate-slide-up"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'forwards',
            }}
          >
            <FoodCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

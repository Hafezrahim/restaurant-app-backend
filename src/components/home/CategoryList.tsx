import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/backend/hooks/useMenuData';
import { cn } from '@/lib/utils';

export const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();

  if (categories.length === 0) return null;

  return (
    <section className="mt-6">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">التصنيفات</h3>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 justify-center">
        {categories.map((cat, index) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/menu?category=${cat.id}`)}
            className={cn(
              'flex flex-col items-center gap-2 min-w-[4.5rem] opacity-0 animate-scale-in',
              `stagger-${index + 1}`
            )}
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-card transition-all duration-200 hover:shadow-elevated hover:scale-105 ring-2 ring-primary/20">
              <img 
                src={cat.image} 
                alt={cat.nameAr}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-foreground">{cat.nameAr}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

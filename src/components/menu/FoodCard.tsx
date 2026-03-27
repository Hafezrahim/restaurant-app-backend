import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, ShoppingCart, Star, GitCompare } from 'lucide-react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useCompare } from '@/context/CompareContext';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface FoodCardProps {
  item: MenuItem;
  variant?: 'default' | 'compact';
  className?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, variant = 'default', className }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare, compareItems } = useCompare();
  const { formatPrice } = useCurrency();
  const favorite = isFavorite(item.id);
  const inCompare = isInCompare(item.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(item);
    toast({
      title: 'تمت الإضافة للسلة',
      description: `تم إضافة ${item.name} إلى سلتك`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item);
    toast({
      title: favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة',
      description: favorite ? `تم إزالة ${item.name}` : `تم حفظ ${item.name}`,
    });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(item.id);
      toast({
        title: 'تمت الإزالة من المقارنة',
        description: `تم إزالة ${item.name}`,
      });
    } else {
      if (compareItems.length >= 4) {
        toast({
          title: 'الحد الأقصى',
          description: 'يمكنك مقارنة 4 أصناف كحد أقصى',
          variant: 'destructive',
        });
        return;
      }
      addToCompare(item);
      toast({
        title: 'تمت الإضافة للمقارنة',
        description: `تم إضافة ${item.name}`,
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/dish/${item.id}`);
  };

  if (variant === 'compact') {
    return (
      <div 
        className={cn('food-card flex gap-3 p-3 cursor-pointer', className)}
        onClick={handleCardClick}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-primary font-bold">{formatPrice(item.price)}</span>
            <Button
              size="sm"
              className="h-7 w-7 p-0 rounded-full btn-primary"
              onClick={handleAddToCart}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn('food-card cursor-pointer', className)}
      onClick={handleCardClick}
    >
      <div className="relative aspect-square">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              favorite
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary'
            )}
          >
            <Heart className={cn('w-4 h-4', favorite && 'fill-current')} />
          </button>
          <button
            onClick={handleToggleCompare}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              inCompare
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-secondary'
            )}
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
        {item.isPopular && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
            الأكثر طلباً
          </span>
        )}
        {item.isNew && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
            جديد
          </span>
        )}
        {/* Rating badge on image - mobile */}
        <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full md:hidden">
          <Star className="w-3 h-3 fill-secondary text-secondary" />
          <span className="text-xs font-semibold text-foreground">{item.rating}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground">{item.name}</h4>
          {/* Rating - desktop only */}
          <div className="hidden md:flex items-center gap-0.5 text-xs text-secondary">
            <Star className="w-3 h-3 fill-current" />
            <span>{item.rating}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary">{formatPrice(item.price)}</span>
          <Button
            size="sm"
            className="rounded-full btn-primary w-9 h-9 p-0"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

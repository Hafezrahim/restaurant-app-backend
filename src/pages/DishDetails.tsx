import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Heart, Minus, Plus, Star, ShoppingCart, Clock, Flame, Users } from 'lucide-react';
import { useMenuItems, useMenuItem } from '@/backend/hooks/useMenuData';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';
import { Helmet } from 'react-helmet-async';
import { SeoLinks } from '@/components/seo/SeoLinks';
import { absUrl } from '@/lib/seo';
import { FoodCard } from '@/components/menu/FoodCard';
import { DishReviews } from '@/components/dish/DishReviews';

const DishDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { formatPrice } = useCurrency();
  const { data: menuItems = [] } = useMenuItems();
  const { data: dish } = useMenuItem(id);

  const cartItem = items.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;
  const favorite = dish ? isFavorite(dish.id) : false;

  const suggestedItems = React.useMemo(() => {
    if (!dish) return [];
    const otherCategories = ['drinks', 'desserts', 'eastern', 'asian', 'arabic'].filter(
      (cat) => cat !== dish.category
    );
    const suggestions: typeof menuItems = [];
    for (const cat of otherCategories) {
      const catItems = menuItems.filter((item) => item.category === cat && item.id !== dish.id);
      if (catItems.length > 0) {
        suggestions.push(catItems[Math.floor(Math.random() * catItems.length)]);
      }
      if (suggestions.length >= 4) break;
    }
    return suggestions;
  }, [dish, menuItems]);

  if (!dish) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">الطبق غير موجود</h1>
          <Button onClick={() => navigate('/menu')} className="btn-primary rounded-full mt-4">العودة للقائمة</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(dish);
    toast({ title: 'تمت الإضافة للسلة', description: `تم إضافة ${dish.name} إلى سلتك` });
  };

  const handleToggleFavorite = () => {
    toggleFavorite(dish);
    toast({
      title: favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة',
      description: favorite ? `تم إزالة ${dish.name}` : `تم حفظ ${dish.name}`,
    });
  };

  const handleIncrement = () => {
    if (quantity === 0) addItem(dish);
    else updateQuantity(dish.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) updateQuantity(dish.id, quantity - 1);
  };

  return (
    <>
      <Helmet>
        <title>{dish.name} - مطعم مزاج</title>
        <meta name="description" content={dish.description} />
        <meta property="og:title" content={`${dish.name} - مطعم مزاج`} />
        <meta property="og:description" content={dish.description} />
        <meta property="og:type" content="product" />
        {dish.image && <meta property="og:image" content={dish.image} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: dish.name,
          description: dish.description,
          image: dish.image,
          url: absUrl(`/dish/${dish.id}`),
          sku: String(dish.id),
          brand: { "@type": "Brand", name: "مطعم مزاج" },
          offers: {
            "@type": "Offer",
            url: absUrl(`/dish/${dish.id}`),
            price: Number(dish.price) || 0,
            priceCurrency: "SAR",
            availability: "https://schema.org/InStock"
          },
          ...(dish.rating ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Number(dish.rating),
              reviewCount: 1,
              bestRating: 5,
              worstRating: 1
            }
          } : {})
        })}</script>
      </Helmet>
      <SeoLinks path={`/dish/${dish.id}`} />

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-background pb-32" key={id}>
        <div className="relative h-72 sm:h-96 animate-fade-in">
          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <button onClick={() => navigate(-1)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground shadow-card transition-all hover:bg-background">
            <ArrowRight className="w-5 h-5" />
          </button>
          <button onClick={handleToggleFavorite} className={cn('absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-card transition-all', favorite ? 'bg-primary text-primary-foreground' : 'bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary')}>
            <Heart className={cn('w-5 h-5', favorite && 'fill-current')} />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-2">
            {dish.isPopular && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-secondary text-secondary-foreground shadow-card">الأكثر طلباً</span>}
            {dish.isNew && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-accent text-accent-foreground shadow-card">جديد</span>}
          </div>
        </div>

        <div className="px-4 -mt-6 relative z-10">
          <div className="bg-card rounded-3xl shadow-elevated p-5 animate-slide-up">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{dish.name}</h1>
                <p className="text-primary text-xl font-bold mt-1">{formatPrice(dish.price)}</p>
              </div>
              <div className="flex items-center gap-1 bg-secondary/20 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-secondary text-secondary" />
                <span className="font-semibold text-foreground">{dish.rating}</span>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">الوصف</h3>
              <p className="text-foreground leading-relaxed">{dish.description}</p>
            </div>
            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">المكونات</h3>
                <div className="flex flex-wrap gap-2">
                  {dish.ingredients.map((ingredient, index) => (
                    <span key={index} className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-foreground">{ingredient}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between bg-muted rounded-2xl p-4">
              <span className="font-semibold text-foreground">الكمية</span>
              <div className="flex items-center gap-4">
                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={handleDecrement} disabled={quantity === 0}><Minus className="w-4 h-4" /></Button>
                <span className="w-8 text-center text-xl font-bold text-foreground">{quantity}</span>
                <Button size="icon" className="h-10 w-10 rounded-full btn-primary" onClick={handleIncrement}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          {/* Reviews - Mobile */}
          <div className="mt-6 bg-card rounded-3xl shadow-elevated p-5">
            <h3 className="text-lg font-bold text-foreground mb-4">التقييمات والمراجعات</h3>
            <DishReviews dishId={dish.id} dishRating={dish.rating} />
          </div>

          {/* Suggested Items - Mobile */}
          {suggestedItems.length > 0 && (
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-bold text-foreground mb-3">قد يعجبك أيضاً</h3>
              <div className="grid grid-cols-2 gap-3">
                {suggestedItems.map((item) => <FoodCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-floating">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">الإجمالي</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice((dish.price * (quantity || 1)).toFixed(2))}</p>
            </div>
            <Button size="lg" className="btn-primary rounded-full px-8 flex items-center gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="w-5 h-5" />
              أضف للسلة
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop / Web Layout */}
      <div className="hidden md:block min-h-screen bg-background" key={`desktop-${id}`}>
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">الرئيسية</button>
            <span>/</span>
            <button onClick={() => navigate('/menu')} className="hover:text-primary transition-colors">القائمة</button>
            <span>/</span>
            <span className="text-foreground font-medium">{dish.name}</span>
          </div>

          {/* Main Content - Two Column */}
          <div className="grid grid-cols-2 gap-10">
            {/* Left - Image */}
            <div className="relative animate-fade-in">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-elevated hover-scale">
                <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {dish.isPopular && <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-secondary text-secondary-foreground shadow-card animate-scale-in">🔥 الأكثر طلباً</span>}
                {dish.isNew && <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-accent text-accent-foreground shadow-card animate-scale-in">✨ جديد</span>}
              </div>
              <button onClick={handleToggleFavorite} className={cn('absolute top-4 left-4 w-11 h-11 rounded-full flex items-center justify-center shadow-card transition-all duration-200 hover:scale-110', favorite ? 'bg-primary text-primary-foreground' : 'bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-primary')}>
                <Heart className={cn('w-5 h-5 transition-transform duration-200', favorite && 'fill-current scale-110')} />
              </button>
            </div>

            {/* Right - Details */}
            <div className="flex flex-col animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-foreground">{dish.name}</h1>
                <div className="flex items-center gap-1.5 bg-secondary/15 px-4 py-2 rounded-full shrink-0">
                  <Star className="w-5 h-5 fill-secondary text-secondary" />
                  <span className="font-bold text-foreground text-lg">{dish.rating}</span>
                </div>
              </div>

              <p className="text-3xl font-bold text-primary mt-3">{formatPrice(dish.price)}</p>

              {/* Quick Info Pills */}
              <div className="flex gap-3 mt-5">
                {[
                  { icon: Clock, label: '25-35 دقيقة', color: 'text-muted-foreground' },
                  { icon: Flame, label: '350 سعرة', color: 'text-primary' },
                  { icon: Users, label: 'يكفي شخصين', color: 'text-muted-foreground' },
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm animate-scale-in" style={{ animationDelay: `${200 + i * 100}ms` }}>
                    <info.icon className={cn('w-4 h-4', info.color)} />
                    <span className="text-foreground font-medium">{info.label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-base font-semibold text-muted-foreground mb-2">الوصف</h3>
                <p className="text-foreground leading-relaxed text-base">{dish.description}</p>
              </div>

              {/* Ingredients */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold text-muted-foreground mb-3">المكونات</h3>
                  <div className="flex flex-wrap gap-2">
                    {dish.ingredients.map((ingredient, index) => (
                      <span key={index} className="px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground border border-border/50 animate-scale-in" style={{ animationDelay: `${300 + index * 50}ms` }}>
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="mt-auto pt-8">
                <div className="flex items-center gap-6 bg-card border border-border rounded-2xl p-5 shadow-card animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center gap-5">
                    <span className="font-semibold text-foreground">الكمية</span>
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-full transition-transform active:scale-90" onClick={handleDecrement} disabled={quantity === 0}><Minus className="w-4 h-4" /></Button>
                      <span className="w-10 text-center text-xl font-bold text-foreground">{quantity}</span>
                      <Button size="icon" className="h-10 w-10 rounded-full btn-primary transition-transform active:scale-90" onClick={handleIncrement}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">الإجمالي</p>
                      <p className="text-2xl font-bold text-foreground">{formatPrice((dish.price * (quantity || 1)).toFixed(2))}</p>
                    </div>
                    <Button size="lg" className="btn-primary rounded-full px-8 flex items-center gap-2 text-base transition-transform hover:scale-105 active:scale-95" onClick={handleAddToCart}>
                      <ShoppingCart className="w-5 h-5" />
                      أضف للسلة
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section - Desktop */}
          <div className="mt-14 bg-card rounded-3xl shadow-elevated p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-bold text-foreground mb-6">التقييمات والمراجعات</h2>
            <DishReviews dishId={dish.id} dishRating={dish.rating} />
          </div>

          {/* You May Also Like Section */}
          {suggestedItems.length > 0 && (
            <div className="mt-14 mb-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">قد يعجبك أيضاً</h2>
                  <p className="text-muted-foreground mt-1">أطباق مختارة تناسب ذوقك</p>
                </div>
                <Button variant="outline" className="rounded-full" onClick={() => navigate('/menu')}>عرض القائمة كاملة</Button>
              </div>
              <div className="grid grid-cols-4 gap-5">
                {suggestedItems.map((item) => <FoodCard key={item.id} item={item} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DishDetails;

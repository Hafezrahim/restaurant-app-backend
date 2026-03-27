import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { FoodCard } from '@/components/menu/FoodCard';
import { Footer } from '@/components/layout/Footer';
import { useCategories, useMenuItems } from '@/backend/hooks/useMenuData';
import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X, Star, TrendingUp, TrendingDown, Mic, MicOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { toast } from 'sonner';
import { useCurrency } from '@/context/CurrencyContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as Category | null;
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  const { isListening, transcript, startListening, stopListening, isSupported, language, setLanguage } = useSpeechRecognition();
  const { currency } = useCurrency();
  const { data: menuItems = [] } = useMenuItems();
  const { data: categories = [] } = useCategories();

  // Update search query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript);
    }
  }, [transcript]);

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!isSupported) {
        toast.error('المتصفح لا يدعم البحث الصوتي');
        return;
      }
      toast.info(language === 'ar' ? 'جارٍ الاستماع... تحدث الآن' : 'Listening... Speak now');
      startListening();
    }
  };

  const maxPrice = Math.max(...menuItems.map(item => item.price));

  const filteredItems = useMemo(() => {
    let items = menuItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      
      // Search filter
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Price filter - only apply if user has changed from defaults
      if (priceRange[0] > 0 && item.price < priceRange[0]) return false;
      if (priceRange[1] < maxPrice && item.price > priceRange[1]) return false;
      
      // Rating filter
      if (item.rating < minRating) return false;
      
      return true;
    });

    // Sort by price
    if (priceSort === 'asc') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      items = [...items].sort((a, b) => b.price - a.price);
    }

    return items;
  }, [menuItems, activeCategory, searchQuery, priceRange, minRating, priceSort, maxPrice]);

  const handleCategoryChange = (cat: Category | 'all') => {
    setActiveCategory(cat);
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setActiveCategory('all');
    setPriceSort('none');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || priceRange[0] > 0 || priceRange[1] < maxPrice || minRating > 0 || priceSort !== 'none';

  return (
    <>
      <Helmet>
        <title>القائمة - مطعم مزاج</title>
        <meta
          name="description"
          content="تصفح قائمتنا الكاملة من الأطباق العربية والشرقية والآسيوية. من المشاوي إلى السوشي الطازج."
        />
      </Helmet>
      <AppLayout title="القائمة">
        {/* Search and Filter Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في القائمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 pl-10"
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded-full text-muted-foreground hover:text-primary transition-colors text-xs font-medium"
                    title="اختر لغة البحث الصوتي"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[120px]">
                  <DropdownMenuItem 
                    onClick={() => setLanguage('ar')}
                    className={cn(language === 'ar' && 'bg-accent')}
                  >
                    🇸🇦 العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage('en')}
                    className={cn(language === 'en' && 'bg-accent')}
                  >
                    🇺🇸 English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Voice Search Button with Animation */}
              <button
                onClick={handleVoiceSearch}
                className={cn(
                  "relative p-1.5 rounded-full transition-all duration-300",
                  isListening 
                    ? "text-destructive bg-destructive/10" 
                    : "text-muted-foreground hover:text-primary"
                )}
                title={isListening ? "إيقاف الاستماع" : "البحث الصوتي"}
              >
                {/* Animated rings when listening */}
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
                    <span className="absolute inset-[-4px] rounded-full border-2 border-destructive/30 animate-pulse" />
                    <span className="absolute inset-[-8px] rounded-full border border-destructive/20 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </>
                )}
                {isListening ? (
                  <MicOff className="w-4 h-4 relative z-10 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4 relative z-10" />
                )}
              </button>
            </div>
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6" dir="rtl">
                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    نطاق السعر: {priceRange[0]} - {priceRange[1]} {currency.symbol}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    max={maxPrice}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    الحد الأدنى للتقييم: {minRating}
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-colors',
                          minRating === rating 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'border-border hover:border-primary'
                        )}
                      >
                        {rating === 0 ? 'الكل' : (
                          <>
                            <Star className="w-3 h-3 fill-current" />
                            {rating}+
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    <X className="w-4 h-4 ml-2" />
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
          <button
            onClick={() => handleCategoryChange('all')}
            className={cn('category-chip whitespace-nowrap', activeCategory === 'all' && 'active')}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                'category-chip whitespace-nowrap',
                activeCategory === cat.id && 'active'
              )}
            >
              <span>{cat.icon}</span>
              {cat.nameAr}
            </button>
          ))}
        </div>

        {/* Results Count and Price Sort */}
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} نتيجة
          </div>
          <div className="flex gap-2">
            <Button
              variant={priceSort === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriceSort(priceSort === 'asc' ? 'none' : 'asc')}
              className="text-xs"
            >
              <TrendingDown className="w-3 h-3 ml-1" />
              الأقل سعراً
            </Button>
            <Button
              variant={priceSort === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPriceSort(priceSort === 'desc' ? 'none' : 'desc')}
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 ml-1" />
              الأعلى سعراً
            </Button>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
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
            ))
          ) : (
            <div className="col-span-2 py-12 text-center">
              <p className="text-muted-foreground mb-4">لا توجد نتائج مطابقة</p>
              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            </div>
          )}
        </div>
        <Footer />
      </AppLayout>
    </>
  );
};

export default Menu;

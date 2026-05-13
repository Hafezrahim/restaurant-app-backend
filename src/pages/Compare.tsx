import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Trash2, Plus, ShoppingCart, ArrowUpDown, Share2, Link, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCategories } from '@/backend/hooks/useMenuData';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

const CompareHelmet = () => (
  <Helmet>
    <title>مقارنة الأصناف - مطعم مزاج</title>
    <meta name="description" content="قارن بين أطباقك المختارة من قائمة مطعم مزاج جنبًا إلى جنب من حيث السعر والتقييم والمكونات." />
    <link rel="canonical" href="/compare" />
    <meta property="og:title" content="مقارنة الأصناف - مطعم مزاج" />
    <meta property="og:description" content="قارن بين أطباق مطعم مزاج جنبًا إلى جنب لاختيار الأفضل لك." />
    <meta property="og:url" content="/compare" />
  </Helmet>
);

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-asc' | 'rating-desc';

const Compare: React.FC = () => {
  const navigate = useNavigate();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const { data: categories = [] } = useCategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.nameAr || categoryId;
  };

  const sortedItems = useMemo(() => {
    if (sortBy === 'default') return compareItems;
    
    return [...compareItems].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [compareItems, sortBy]);

  const handleAddToCart = (item: typeof compareItems[0]) => {
    addItem(item);
    toast.success(`تمت إضافة ${item.name} إلى السلة`);
  };

  const handleShare = (type: 'copy' | 'facebook' | 'twitter' | 'whatsapp') => {
    const itemNames = compareItems.map(item => item.name).join('، ');
    const shareUrl = window.location.href;
    const shareText = `مقارنة بين: ${itemNames}`;

    switch (type) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('تم نسخ الرابط!');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
    }
  };

  if (compareItems.length === 0) {
    return (
      <AppLayout>
        <CompareHelmet />
        <div className="p-4" dir="rtl">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted">
              <ArrowRight className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">مقارنة الأصناف</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h2 className="text-xl font-bold mb-2">لا توجد أصناف للمقارنة</h2>
            <p className="text-muted-foreground mb-6">أضف أصناف من القائمة للمقارنة بينها</p>
            <Button onClick={() => navigate('/menu')}>
              تصفح القائمة
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <CompareHelmet />
      <div className="p-4" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted">
              <ArrowRight className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">مقارنة الأصناف ({compareItems.length})</h1>
          </div>
          <Button variant="outline" size="sm" onClick={clearCompare}>
            <Trash2 className="w-4 h-4 ml-2" />
            مسح الكل
          </Button>
        </div>

        {/* Sort and Share Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 ml-2" />
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">الافتراضي</SelectItem>
              <SelectItem value="price-asc">السعر: من الأقل</SelectItem>
              <SelectItem value="price-desc">السعر: من الأعلى</SelectItem>
              <SelectItem value="rating-asc">التقييم: من الأقل</SelectItem>
              <SelectItem value="rating-desc">التقييم: من الأعلى</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleShare('copy')}>
                <Link className="w-4 h-4 ml-2" />
                نسخ الرابط
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')}>
                <Facebook className="w-4 h-4 ml-2" />
                فيسبوك
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                <Twitter className="w-4 h-4 ml-2" />
                تويتر
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                <MessageCircle className="w-4 h-4 ml-2" />
                واتساب
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Images Row */}
            <thead>
              <tr>
                <th className="p-3 text-right bg-muted/50 rounded-tr-lg min-w-[100px]">الصنف</th>
                {sortedItems.map((item) => (
                  <th key={item.id} className="p-3 bg-muted/50 min-w-[200px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute -top-1 -left-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </th>
                ))}
                {sortedItems.length < 4 && (
                  <th className="p-3 bg-muted/50 rounded-tl-lg min-w-[150px]">
                    <button
                      onClick={() => navigate('/menu')}
                      className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                    >
                      <Plus className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">أضف صنف</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody>
              {/* Name Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">الاسم</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center font-bold">
                    {item.name}
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Category Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">التصنيف</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <Badge variant="secondary">{getCategoryName(item.category)}</Badge>
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Price Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">السعر</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <span className="text-lg font-bold text-primary">{formatPrice(item.price)}</span>
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Rating Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">التقييم</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{item.rating}</span>
                    </div>
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Description Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">الوصف</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center text-sm text-muted-foreground">
                    {item.description}
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Ingredients Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">المكونات</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {item.ingredients?.map((ing, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Badges Row */}
              <tr className="border-b border-border">
                <td className="p-3 font-medium bg-muted/30">العلامات</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {item.isPopular && (
                        <Badge className="bg-primary">شائع</Badge>
                      )}
                      {item.isNew && (
                        <Badge className="bg-accent">جديد</Badge>
                      )}
                      {!item.isPopular && !item.isNew && (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </div>
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3"></td>}
              </tr>

              {/* Add to Cart Row */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 rounded-br-lg">إضافة للسلة</td>
                {sortedItems.map((item) => (
                  <td key={item.id} className="p-3 text-center">
                    <Button onClick={() => handleAddToCart(item)} className="w-full">
                      <ShoppingCart className="w-4 h-4 ml-2" />
                      أضف للسلة
                    </Button>
                  </td>
                ))}
                {sortedItems.length < 4 && <td className="p-3 rounded-bl-lg"></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Compare;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { POSGrid } from '@/components/cart/POSGrid';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <>
      <Helmet>
        <title>سلة التسوق - مطعم مزاج</title>
        <meta name="description" content="راجع أصناف سلة التسوق الخاصة بك في مطعم مزاج وأكمل عملية الطلب بسهولة وأمان عبر طرق دفع متعددة." />
        <link rel="canonical" href="/cart" />
        <meta property="og:title" content="سلة التسوق - مطعم مزاج" />
        <meta property="og:description" content="راجع أصناف سلة التسوق الخاصة بك في مطعم مزاج وأكمل عملية الطلب بسهولة وأمان." />
        <meta property="og:url" content="/cart" />
      </Helmet>
      <AppLayout title="سلة التسوق" showSearch={false}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">سلتك فارغة</h2>
            <p className="text-muted-foreground text-sm mb-6">
              أضف بعض الأطباق الشهية للبدء
            </p>
            <POSGrid />
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* POS Quick Add Section */}
            <POSGrid />

            {/* Order Summary */}
            <div className="fixed bottom-[calc(var(--nav-height)+1rem)] left-4 right-4 max-w-screen-xl mx-auto bg-card rounded-2xl shadow-floating p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {totalItems} {totalItems === 1 ? 'صنف' : 'أصناف'}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{formatPrice(totalPrice.toFixed(2))}</p>
                </div>
                <Button 
                  size="lg" 
                  className="btn-primary rounded-full px-8"
                  onClick={() => navigate('/checkout')}
                >
                  إتمام الطلب
                </Button>
              </div>
            </div>
          </>
        )}
        <Footer />
      </AppLayout>
    </>
  );
};

export default Cart;

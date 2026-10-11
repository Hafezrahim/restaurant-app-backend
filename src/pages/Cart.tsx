import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { POSGrid } from '@/components/cart/POSGrid';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { SeoLinks } from '@/components/seo/SeoLinks';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, totalItems } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <>
      <Helmet>
        <title>سلة التسوق - مطعم مزاج</title>
        <meta name="description" content="راجع أصناف سلة التسوق الخاصة بك في مطعم مزاج وأكمل عملية الطلب بسهولة وأمان عبر طرق دفع متعددة." />
        <meta property="og:title" content="سلة التسوق - مطعم مزاج" />
        <meta property="og:description" content="راجع أصناف سلة التسوق الخاصة بك في مطعم مزاج وأكمل عملية الطلب بسهولة وأمان." />
      </Helmet>
      <SeoLinks path="/cart" />
      <AppLayout title="سلة التسوق" showSearch={false}>
        <div dir="rtl" className={items.length ? 'pb-28 lg:pb-0' : ''}>
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShoppingBag className="h-6 w-6" /></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">سلة التسوق</h1>
                <p className="mt-1 text-sm text-muted-foreground">{items.length ? `${items.length} أصناف · ${totalItems} قطعة` : 'طلبك يبدأ بطبق تحبه'}</p>
              </div>
            </div>
            <Button variant="ghost" className="text-primary" onClick={() => navigate('/menu')}><ArrowRight /> متابعة التسوق</Button>
          </header>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:gap-10">
            <section aria-labelledby="your-order-title" className="min-w-0 lg:order-2 lg:sticky lg:top-24 lg:border-r lg:border-border lg:pr-6">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <h2 id="your-order-title" className="text-lg font-bold">طلبك</h2>
                <span className="text-sm text-muted-foreground">{totalItems} قطعة</span>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <UtensilsCrossed className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 text-lg font-bold">سلتك فارغة</h3>
                  <p className="text-sm text-muted-foreground">أضف بعض الأطباق الشهية للبدء</p>
                </div>
              ) : <div>{items.map((item) => <CartItem key={item.id} item={item} />)}</div>}
              <div className="mt-4 border-t border-border pt-5">
                <h3 className="mb-4 font-bold">ملخص الطلب</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">مجموع الأطباق</dt><dd className="font-semibold tabular-nums">{formatPrice(totalPrice.toFixed(2))}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">رسوم التوصيل</dt><dd className="text-muted-foreground">تُحدد عند إتمام الطلب</dd></div>
                </dl>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="font-bold">المجموع الفرعي</span><span className="text-xl font-bold text-primary tabular-nums" aria-live="polite">{formatPrice(totalPrice.toFixed(2))}</span></div>
                <Button size="lg" className="mt-4 h-12 w-full rounded-lg" disabled={!items.length} onClick={() => navigate('/checkout')}>إتمام الطلب <ArrowLeft /></Button>
              </div>
            </section>
            <div className="min-w-0 lg:order-1"><POSGrid /></div>
          </div>
          <div className="mt-10"><Footer /></div>
          {items.length > 0 && <div className="fixed inset-x-0 bottom-[var(--nav-height)] z-40 border-t border-border bg-card p-3 shadow-floating lg:hidden">
            <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3">
              <div className="min-w-0"><p className="text-xs text-muted-foreground">المجموع الفرعي · {totalItems} قطعة</p><p className="mt-1 whitespace-nowrap text-lg font-bold tabular-nums">{formatPrice(totalPrice.toFixed(2))}</p></div>
              <Button size="lg" className="h-12 shrink-0 rounded-lg px-5" onClick={() => navigate('/checkout')}>إتمام الطلب <ArrowLeft /></Button>
            </div>
          </div>}
        </div>
      </AppLayout>
    </>
  );
};

export default Cart;

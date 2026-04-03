import React, { useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { 
  Clock, CheckCircle, Truck, Package, XCircle, MapPin, Phone, CreditCard, 
  Download, ArrowRight, User, CalendarDays, Hash, ShoppingBag, Receipt
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgClass: string; borderClass: string; step: number }> = {
  pending: { icon: <Clock className="w-4 h-4" />, label: 'قيد الانتظار', color: 'text-amber-600', bgClass: 'bg-amber-50', borderClass: 'border-amber-200', step: 1 },
  confirmed: { icon: <Package className="w-4 h-4" />, label: 'مؤكد', color: 'text-primary', bgClass: 'bg-primary/5', borderClass: 'border-primary/20', step: 2 },
  preparing: { icon: <Package className="w-4 h-4" />, label: 'قيد التجهيز', color: 'text-accent', bgClass: 'bg-accent/5', borderClass: 'border-accent/20', step: 3 },
  out_for_delivery: { icon: <Truck className="w-4 h-4" />, label: 'في الطريق', color: 'text-accent', bgClass: 'bg-accent/5', borderClass: 'border-accent/20', step: 4 },
  delivered: { icon: <CheckCircle className="w-4 h-4" />, label: 'تم التوصيل', color: 'text-emerald-600', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200', step: 5 },
  cancelled: { icon: <XCircle className="w-4 h-4" />, label: 'ملغي', color: 'text-destructive', bgClass: 'bg-destructive/5', borderClass: 'border-destructive/20', step: 0 },
};

const progressSteps = [
  { key: 'pending', label: 'تم الاستلام', icon: <Receipt className="w-3.5 h-3.5" /> },
  { key: 'confirmed', label: 'مؤكد', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { key: 'preparing', label: 'قيد التجهيز', icon: <Package className="w-3.5 h-3.5" /> },
  { key: 'out_for_delivery', label: 'في الطريق', icon: <Truck className="w-3.5 h-3.5" /> },
  { key: 'delivered', label: 'تم التوصيل', icon: <CheckCircle className="w-3.5 h-3.5" /> },
];

const ClientOrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const orders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');
  const orderIndex = parseInt(id || '0', 10);
  const order = orders[orderIndex];

  const handleDownloadPNG = useCallback(async () => {
    if (!invoiceRef.current) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `فاتورة-${order?.trackingNumber || 'order'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('تم تحميل الفاتورة بنجاح');
    } catch {
      toast.error('فشل تحميل الفاتورة');
    }
  }, [order?.trackingNumber]);

  if (!order) {
    return (
      <ClientLayout title="تفاصيل الطلب">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-foreground font-semibold mb-1">الطلب غير موجود</p>
          <p className="text-sm text-muted-foreground mb-4">قد يكون الطلب محذوفاً أو الرابط غير صحيح</p>
          <Button variant="outline" onClick={() => navigate('/client/orders')} className="rounded-xl">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للطلبات
          </Button>
        </div>
      </ClientLayout>
    );
  }

  const status = statusConfig[order.status || 'pending'];
  const currentStep = status.step;

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-SA', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const orderDate = formatOrderDate(order.date || order.dateFormatted || '');

  // Calculate totals from items if not stored
  const itemsSubtotal = order.items?.reduce((s: number, i: any) => s + (i.price * i.quantity), 0) || 0;
  const subtotal = order.subtotal ?? itemsSubtotal;
  const deliveryFee = order.deliveryFee ?? 0;
  const tax = order.tax ?? subtotal * 0.15;
  const total = order.total ?? (subtotal + deliveryFee + tax);

  return (
    <ClientLayout title="تفاصيل الطلب">
      {/* Back Button */}
      <button
        onClick={() => navigate('/client/orders')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group"
      >
        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        العودة للطلبات
      </button>

      {/* Status Card */}
      <div className={`rounded-2xl p-5 mb-5 ${status.bgClass} border ${status.borderClass}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${status.color} bg-background/60`}>
              {status.icon}
            </div>
            <div>
              <p className={`font-bold text-base ${status.color}`}>{status.label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{orderDate}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          <code className="text-xs font-mono text-primary font-bold">{order.trackingNumber}</code>
        </div>
      </div>

      {/* Progress Steps - Vertical */}
      {order.status !== 'cancelled' && (
        <div className="bg-card rounded-2xl p-5 border border-border/30 mb-5">
          <h3 className="font-bold text-foreground text-sm mb-5">تقدم الطلب</h3>
          <div className="space-y-0">
            {progressSteps.map((step, idx) => {
              const isCompleted = currentStep > idx + 1;
              const isCurrent = currentStep === idx + 1;
              const isLast = idx === progressSteps.length - 1;
              return (
                <div key={step.key} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isCompleted ? 'bg-primary text-primary-foreground' :
                      isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {step.icon}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-8 my-1 rounded-full ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`} />
                    )}
                  </div>
                  {/* Label */}
                  <div className="pt-1.5">
                    <p className={`text-sm font-medium ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{step.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Card */}
      <div ref={invoiceRef} className="bg-card rounded-2xl overflow-hidden border border-border/30 mb-5" dir="rtl">
        {/* Header with Logo */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="relative z-10">
            <img src={logo} alt="مزاج" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-3 border-white/30 shadow-lg" />
            <h2 className="text-white font-bold text-xl">مطعم مزاج</h2>
            <p className="text-white/60 text-xs mt-0.5 tracking-wider">MAZAG RESTAURANT</p>
            <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-xl px-5 py-2.5 inline-block">
              <p className="text-white/70 text-[10px] mb-0.5">رقم الفاتورة</p>
              <p className="text-white font-mono font-bold text-sm tracking-widest">{order.trackingNumber}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="px-5 py-3 bg-muted/20 border-b border-border/30 flex items-center justify-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{orderDate}</span>
        </div>

        {/* Customer Info */}
        {order.customer && (
          <div className="p-5 border-b border-dashed border-border/40">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">معلومات العميل</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-foreground font-medium">{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground" dir="ltr">{order.customer.phone}</span>
              </div>
              {order.customer.address && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{order.customer.address}</span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{order.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items Table */}
        <div className="p-5 border-b border-dashed border-border/40">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">تفاصيل الطلب</h4>
          
          {/* Table Header */}
          <div className="flex items-center text-[11px] font-semibold text-muted-foreground pb-2 border-b border-border/30 mb-2">
            <span className="flex-1">الصنف</span>
            <span className="w-14 text-center">الكمية</span>
            <span className="w-16 text-center">السعر</span>
            <span className="w-20 text-left">الإجمالي</span>
          </div>

          {/* Items */}
          <div className="space-y-0 divide-y divide-border/20">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center py-2.5 text-sm">
                <span className="flex-1 text-foreground font-medium truncate pl-2">{item.name}</span>
                <span className="w-14 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-md text-xs font-bold">
                    {item.quantity}
                  </span>
                </span>
                <span className="w-16 text-center text-muted-foreground text-xs">{formatPrice(item.price.toFixed(2))}</span>
                <span className="w-20 text-left font-medium text-foreground text-xs">{formatPrice((item.price * item.quantity).toFixed(2))}</span>
              </div>
            )) || (
              <div className="py-3 text-sm text-muted-foreground text-center">
                {order.itemCount} عناصر
              </div>
            )}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-5 space-y-2.5">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">ملخص الفاتورة</h4>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span className="text-foreground font-medium">{formatPrice(subtotal.toFixed(2))}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              رسوم التوصيل
              {order.deliveryZone && <span className="text-[10px] text-muted-foreground/70">({order.deliveryZone})</span>}
            </span>
            <span className="text-foreground font-medium">{formatPrice(deliveryFee.toFixed(2))}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
            <span className="text-foreground font-medium">{formatPrice(tax.toFixed(2))}</span>
          </div>

          <div className="border-t-2 border-primary/20 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground text-base">الإجمالي الكلي</span>
              <span className="font-bold text-xl text-primary">{formatPrice(total.toFixed(2))}</span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        {order.estimatedTime && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="px-5 py-3 bg-accent/5 border-t border-border/30 flex items-center justify-center gap-2">
            <Truck className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">الوقت المتوقع: <span className="font-bold text-foreground">{order.estimatedTime} دقيقة</span></span>
          </div>
        )}

        {/* Footer */}
        <div className="bg-muted/30 px-5 py-4 text-center border-t border-border/30">
          <p className="text-xs text-muted-foreground">شكراً لتعاملكم معنا 💛</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">مطعم مزاج • MAZAG Restaurant</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <Button onClick={handleDownloadPNG} variant="outline" className="w-full rounded-xl h-12" size="lg">
          <Download className="w-4 h-4 ml-2" />
          تحميل الفاتورة كصورة
        </Button>
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Button
            onClick={() => navigate(`/track-order?order=${order.trackingNumber}`)}
            className="w-full rounded-xl h-12"
            size="lg"
          >
            <Truck className="w-4 h-4 ml-2" />
            تتبع الطلب
          </Button>
        )}
        <Button
          onClick={() => navigate('/menu')}
          variant="ghost"
          className="w-full rounded-xl h-12 text-muted-foreground"
          size="lg"
        >
          <ShoppingBag className="w-4 h-4 ml-2" />
          طلب مرة أخرى
        </Button>
      </div>
    </ClientLayout>
  );
};

export default ClientOrderDetails;

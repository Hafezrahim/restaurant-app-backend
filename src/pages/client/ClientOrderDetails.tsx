import React, { useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { 
  Clock, CheckCircle, Truck, Package, XCircle, MapPin, Phone, CreditCard, 
  Download, ArrowRight, Receipt, User 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgClass: string; step: number }> = {
  pending: { icon: <Clock className="w-4 h-4" />, label: 'قيد الانتظار', color: 'text-amber-600', bgClass: 'bg-amber-500/10', step: 1 },
  confirmed: { icon: <Package className="w-4 h-4" />, label: 'مؤكد', color: 'text-primary', bgClass: 'bg-primary/10', step: 2 },
  preparing: { icon: <Package className="w-4 h-4" />, label: 'قيد التجهيز', color: 'text-accent', bgClass: 'bg-accent/10', step: 3 },
  out_for_delivery: { icon: <Truck className="w-4 h-4" />, label: 'في الطريق', color: 'text-accent', bgClass: 'bg-accent/10', step: 4 },
  delivered: { icon: <CheckCircle className="w-4 h-4" />, label: 'تم التوصيل', color: 'text-emerald-600', bgClass: 'bg-emerald-500/10', step: 5 },
  cancelled: { icon: <XCircle className="w-4 h-4" />, label: 'ملغي', color: 'text-destructive', bgClass: 'bg-destructive/10', step: 0 },
};

const steps = [
  { key: 'pending', label: 'تم الاستلام' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'preparing', label: 'قيد التجهيز' },
  { key: 'out_for_delivery', label: 'في الطريق' },
  { key: 'delivered', label: 'تم التوصيل' },
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
          <p className="text-muted-foreground">الطلب غير موجود</p>
          <Button variant="outline" onClick={() => navigate('/client/orders')} className="mt-4">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للطلبات
          </Button>
        </div>
      </ClientLayout>
    );
  }

  const status = statusConfig[order.status || 'pending'];
  const currentStep = status.step;
  const orderDate = order.date 
    ? new Date(order.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : order.dateFormatted;

  return (
    <ClientLayout title="تفاصيل الطلب">
      {/* Back Button */}
      <button
        onClick={() => navigate('/client/orders')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للطلبات
      </button>

      {/* Status Header */}
      <div className={`rounded-2xl p-5 mb-5 ${status.bgClass} border border-border/20`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.bgClass} ${status.color}`}>
            {status.icon}
          </div>
          <div>
            <p className={`font-bold text-base ${status.color}`}>{status.label}</p>
            <p className="text-xs text-muted-foreground">{orderDate}</p>
          </div>
        </div>
        <code className="text-xs font-mono text-primary font-bold bg-background/60 px-3 py-1.5 rounded-lg inline-block">
          {order.trackingNumber}
        </code>
      </div>

      {/* Progress Steps */}
      {order.status !== 'cancelled' && (
        <div className="bg-card rounded-2xl p-5 border border-border/30 mb-5">
          <h3 className="font-semibold text-foreground text-sm mb-4">تقدم الطلب</h3>
          <div className="flex items-center justify-between relative">
            {/* Connection Line */}
            <div className="absolute top-4 right-4 left-4 h-0.5 bg-border/50 z-0" />
            <div 
              className="absolute top-4 right-4 h-0.5 bg-primary z-0 transition-all duration-500"
              style={{ width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%` }}
            />
            {steps.map((step, idx) => {
              const isCompleted = currentStep > idx + 1;
              const isCurrent = currentStep === idx + 1;
              return (
                <div key={step.key} className="flex flex-col items-center z-10 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted ? 'bg-primary text-primary-foreground' :
                    isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1.5 text-center max-w-[60px] ${
                    isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                  }`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Card - used for PNG download */}
      <div ref={invoiceRef} className="bg-card rounded-2xl overflow-hidden border border-border/30 mb-5" dir="rtl">
        {/* Invoice Header with Logo */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center">
          <img src={logo} alt="مزاج" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 border-2 border-white/30" />
          <h2 className="text-white font-bold text-lg">مطعم مزاج</h2>
          <p className="text-white/70 text-xs mt-1">MAZAG Restaurant</p>
          <div className="mt-3 bg-white/15 rounded-xl px-4 py-2 inline-block">
            <p className="text-white/80 text-[10px]">رقم الفاتورة</p>
            <p className="text-white font-mono font-bold text-sm tracking-wider">{order.trackingNumber}</p>
          </div>
        </div>

        {/* Customer & Delivery Info */}
        <div className="p-4 space-y-3 border-b border-dashed border-border/50">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{orderDate}</span>
          </div>
          {order.customer && (
            <>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground font-medium">{order.customer.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground" dir="ltr">{order.customer.phone}</span>
              </div>
              {order.customer.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{order.customer.address}</span>
                </div>
              )}
            </>
          )}
          {order.paymentMethod && (
            <div className="flex items-center gap-3 text-sm">
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <span className="text-muted-foreground">{order.paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="p-4 border-b border-dashed border-border/50">
          <h4 className="font-semibold text-foreground text-sm mb-3">الأصناف المطلوبة</h4>
          <div className="space-y-2.5">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatPrice((item.price * item.quantity).toFixed(2))}
                </span>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">{order.itemCount} عناصر</p>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="p-4 space-y-2">
          {order.subtotal != null && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span className="text-foreground">{formatPrice(order.subtotal.toFixed(2))}</span>
            </div>
          )}
          {order.deliveryFee != null && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">رسوم التوصيل{order.deliveryZone ? ` (${order.deliveryZone})` : ''}</span>
              <span className="text-foreground">{formatPrice(order.deliveryFee.toFixed(2))}</span>
            </div>
          )}
          {order.tax != null && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الضريبة (15%)</span>
              <span className="text-foreground">{formatPrice(order.tax.toFixed(2))}</span>
            </div>
          )}
          <div className="border-t border-border pt-3 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-foreground">الإجمالي</span>
              <span className="font-bold text-lg text-primary">{formatPrice(order.total?.toFixed(2))}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 p-3 text-center border-t border-border/30">
          <p className="text-[10px] text-muted-foreground">شكراً لتعاملكم معنا • مطعم مزاج</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-6">
        <Button onClick={handleDownloadPNG} variant="outline" className="w-full rounded-xl" size="lg">
          <Download className="w-4 h-4 ml-2" />
          تحميل الفاتورة كصورة
        </Button>
        <Button
          onClick={() => navigate(`/track-order?order=${order.trackingNumber}`)}
          className="w-full rounded-xl"
          size="lg"
        >
          <Truck className="w-4 h-4 ml-2" />
          تتبع الطلب
        </Button>
      </div>
    </ClientLayout>
  );
};

export default ClientOrderDetails;

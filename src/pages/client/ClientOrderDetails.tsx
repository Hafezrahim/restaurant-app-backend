import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { useClientAuth } from '@/context/ClientAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Clock, CheckCircle, Truck, Package, XCircle, MapPin, Phone, CreditCard, 
  Download, ArrowRight, User, CalendarDays, Hash, ShoppingBag, Receipt, Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgClass: string; step: number }> = {
  pending: { icon: <Clock className="w-4 h-4" />, label: 'قيد الانتظار', color: 'text-amber-600', bgClass: 'bg-amber-100 dark:bg-amber-500/15', step: 1 },
  confirmed: { icon: <Package className="w-4 h-4" />, label: 'مؤكد', color: 'text-primary', bgClass: 'bg-primary/10', step: 2 },
  preparing: { icon: <Package className="w-4 h-4" />, label: 'قيد التجهيز', color: 'text-accent', bgClass: 'bg-accent/10', step: 3 },
  out_for_delivery: { icon: <Truck className="w-4 h-4" />, label: 'في الطريق', color: 'text-accent', bgClass: 'bg-accent/10', step: 4 },
  delivered: { icon: <CheckCircle className="w-4 h-4" />, label: 'تم التوصيل', color: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-500/15', step: 5 },
  cancelled: { icon: <XCircle className="w-4 h-4" />, label: 'ملغي', color: 'text-destructive', bgClass: 'bg-destructive/10', step: 0 },
};

const progressSteps = [
  { key: 'pending', label: 'تم الاستلام', icon: <Receipt className="w-3.5 h-3.5" /> },
  { key: 'confirmed', label: 'مؤكد', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { key: 'preparing', label: 'قيد التجهيز', icon: <Package className="w-3.5 h-3.5" /> },
  { key: 'out_for_delivery', label: 'في الطريق', icon: <Truck className="w-3.5 h-3.5" /> },
  { key: 'delivered', label: 'تم التوصيل', icon: <CheckCircle className="w-3.5 h-3.5" /> },
];

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقداً عند الاستلام',
  card: 'بطاقة ائتمان',
  bank_transfer: 'تحويل بنكي',
};

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  payment_method: string;
  notes: string | null;
  order_items: { name: string; quantity: number; price: number }[];
}

const ClientOrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { user } = useClientAuth();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) { setIsLoading(false); return; }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(name, quantity, price)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setOrder(data as OrderData);
      }
      setIsLoading(false);
    };
    fetchOrder();

    // Realtime for status changes
    const channel = supabase
      .channel(`order-detail-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${id}`,
      }, (payload) => {
        setOrder(prev => prev ? { ...prev, ...payload.new } : prev);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, user]);

  const handleDownloadPNG = useCallback(async () => {
    if (!invoiceRef.current) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false,
      });
      const link = document.createElement('a');
      link.download = `فاتورة-${order?.order_number || 'order'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('تم تحميل الفاتورة بنجاح');
    } catch {
      toast.error('فشل تحميل الفاتورة');
    }
  }, [order?.order_number]);

  if (isLoading) {
    return (
      <ClientLayout title="تفاصيل الطلب">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  if (!order) {
    return (
      <ClientLayout title="تفاصيل الطلب">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-9 h-9 text-muted-foreground/40" />
          </div>
          <p className="text-foreground font-bold mb-1">الطلب غير موجود</p>
          <p className="text-sm text-muted-foreground mb-5">قد يكون الطلب محذوفاً أو الرابط غير صحيح</p>
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
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const orderDate = formatOrderDate(order.created_at);
  const subtotal = order.subtotal ?? 0;
  const deliveryFee = order.delivery_fee ?? 0;
  const tax = subtotal * 0.15;
  const total = order.total ?? 0;

  return (
    <ClientLayout title="تفاصيل الطلب">
      {/* Back */}
      <button
        onClick={() => navigate('/client/orders')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5 transition-colors group font-medium"
      >
        <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        العودة للطلبات
      </button>

      {/* Status Card */}
      <div className={`rounded-2xl p-5 mb-5 ${status.bgClass} border border-border/10`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.color} bg-white/60 dark:bg-background/40 shadow-sm`}>
            {status.icon}
          </div>
          <div className="flex-1">
            <p className={`font-bold text-base ${status.color}`}>{status.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CalendarDays className="w-3 h-3 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">{orderDate}</p>
            </div>
          </div>
          <code className="text-[11px] font-mono text-primary font-bold bg-white/60 dark:bg-background/40 px-3 py-1.5 rounded-lg">{order.order_number}</code>
        </div>
      </div>

      {/* Progress Steps */}
      {order.status !== 'cancelled' && (
        <div className="bg-white dark:bg-card rounded-2xl p-5 border border-border/15 mb-5 shadow-sm">
          <h3 className="font-bold text-foreground text-sm mb-4">تقدم الطلب</h3>
          <div className="flex items-start justify-between">
            {progressSteps.map((step, idx) => {
              const isCompleted = currentStep > idx + 1;
              const isCurrent = currentStep === idx + 1;
              const isLast = idx === progressSteps.length - 1;
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isCompleted ? 'bg-primary text-white shadow-md shadow-primary/20' :
                      isCurrent ? 'bg-primary text-white ring-4 ring-primary/15 shadow-md' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>
                      {step.icon}
                    </div>
                    <p className={`text-[10px] font-semibold text-center whitespace-nowrap ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>{step.label}</p>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 flex-1 mx-1 mt-[-18px] rounded-full transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-border/50'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Card */}
      <div ref={invoiceRef} className="bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/15 mb-5 shadow-sm" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-bl from-primary via-primary to-primary/85 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <img src={logo} alt="مزاج" className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 border-2 border-white/20 shadow-lg" />
            <h2 className="text-white font-bold text-xl">مطعم مزاج</h2>
            <p className="text-white/50 text-[10px] mt-0.5 tracking-widest font-medium">MAZAG RESTAURANT</p>
            <div className="mt-4 bg-white/12 backdrop-blur-sm rounded-xl px-5 py-2.5 inline-block">
              <p className="text-white/60 text-[10px] mb-0.5">رقم الفاتورة</p>
              <p className="text-white font-mono font-bold text-sm tracking-widest">{order.order_number}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="px-5 py-3 bg-muted/20 border-b border-border/15 flex items-center justify-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{orderDate}</span>
        </div>

        {/* Customer Info */}
        <div className="p-5 border-b border-dashed border-border/30">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">معلومات العميل</h4>
          <div className="space-y-2.5">
            {[
              { icon: User, text: order.customer_name },
              { icon: Phone, text: order.customer_phone, dir: 'ltr' },
              order.delivery_address && { icon: MapPin, text: order.delivery_address },
              { icon: CreditCard, text: paymentMethodLabels[order.payment_method] || order.payment_method },
            ].filter(Boolean).map((item: any, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className={`${idx === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`} dir={item.dir}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Items Table */}
        <div className="p-5 border-b border-dashed border-border/30">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">تفاصيل الطلب</h4>
          <div className="flex items-center text-[10px] font-bold text-muted-foreground pb-2 border-b border-border/20 mb-2">
            <span className="flex-1">الصنف</span>
            <span className="w-12 text-center">الكمية</span>
            <span className="w-16 text-center">السعر</span>
            <span className="w-20 text-left">الإجمالي</span>
          </div>
          <div className="divide-y divide-border/10">
            {order.order_items?.map((item, idx) => (
              <div key={idx} className="flex items-center py-3 text-sm">
                <span className="flex-1 text-foreground font-medium truncate pl-2">{item.name}</span>
                <span className="w-12 text-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 bg-primary/8 text-primary rounded-lg text-xs font-bold">{item.quantity}</span>
                </span>
                <span className="w-16 text-center text-muted-foreground text-xs">{formatPrice(item.price.toFixed(2))}</span>
                <span className="w-20 text-left font-semibold text-foreground text-xs">{formatPrice((item.price * item.quantity).toFixed(2))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial */}
        <div className="p-5 space-y-2.5">
          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">ملخص الفاتورة</h4>
          {[
            { label: 'المجموع الفرعي', value: subtotal },
            { label: 'رسوم التوصيل', value: deliveryFee },
            { label: 'ضريبة القيمة المضافة (15%)', value: tax },
            ...(order.discount > 0 ? [{ label: 'الخصم', value: -order.discount }] : []),
          ].map((row, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="text-foreground font-medium">{formatPrice(row.value.toFixed(2))}</span>
            </div>
          ))}
          <div className="border-t-2 border-primary/20 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground text-base">الإجمالي الكلي</span>
              <span className="font-bold text-xl text-primary">{formatPrice(total.toFixed(2))}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/20 px-5 py-4 text-center border-t border-border/15">
          <p className="text-xs text-muted-foreground">شكراً لتعاملكم معنا 💛</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">مطعم مزاج • MAZAG Restaurant</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-8">
        <Button onClick={handleDownloadPNG} variant="outline" className="w-full rounded-xl h-12 border-border/20 shadow-sm" size="lg">
          <Download className="w-4 h-4 ml-2" />
          تحميل الفاتورة كصورة
        </Button>
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Button onClick={() => navigate(`/track-order?order=${order.order_number}`)} className="w-full rounded-xl h-12 shadow-lg shadow-primary/20" size="lg">
            <Truck className="w-4 h-4 ml-2" />
            تتبع الطلب
          </Button>
        )}
        <Button onClick={() => navigate('/menu')} variant="ghost" className="w-full rounded-xl h-12 text-muted-foreground" size="lg">
          <ShoppingBag className="w-4 h-4 ml-2" />
          طلب مرة أخرى
        </Button>
      </div>
    </ClientLayout>
  );
};

export default ClientOrderDetails;

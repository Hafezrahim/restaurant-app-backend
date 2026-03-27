import React from 'react';
import { ShoppingBag, Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="w-4 h-4" />, label: 'قيد الانتظار', color: 'text-secondary bg-secondary/10' },
  confirmed: { icon: <Package className="w-4 h-4" />, label: 'مؤكد', color: 'text-primary bg-primary/10' },
  preparing: { icon: <Truck className="w-4 h-4" />, label: 'قيد التجهيز', color: 'text-accent bg-accent/10' },
  out_for_delivery: { icon: <Truck className="w-4 h-4" />, label: 'في الطريق', color: 'text-accent bg-accent/10' },
  delivered: { icon: <CheckCircle className="w-4 h-4" />, label: 'تم التوصيل', color: 'text-green-600 bg-green-500/10' },
  cancelled: { icon: <XCircle className="w-4 h-4" />, label: 'ملغي', color: 'text-destructive bg-destructive/10' },
};

const ClientOrders: React.FC = () => {
  const orders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');
  const { formatPrice } = useCurrency();

  return (
    <ClientLayout title="طلباتي">
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1">لا توجد طلبات بعد</h3>
          <p className="text-sm text-muted-foreground text-center">ستظهر طلباتك هنا بعد إتمام أول طلب</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any, i: number) => {
            const status = statusConfig[order.status || 'pending'];
            return (
              <div key={i} className="bg-card rounded-2xl p-4 border border-border/30 active:scale-[0.98] transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-xs font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md">
                    {order.trackingNumber}
                  </code>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{order.date}</p>
                <div className="flex justify-between mt-3 pt-3 border-t border-border/30">
                  <span className="text-xs text-muted-foreground">{order.itemCount} عناصر</span>
                  <span className="text-sm font-bold text-foreground">{formatPrice(order.total?.toFixed(2))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ClientLayout>
  );
};

export default ClientOrders;

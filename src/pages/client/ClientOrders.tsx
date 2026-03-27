import React from 'react';
import { ShoppingBag, Clock, CheckCircle, Truck } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Helmet } from 'react-helmet-async';

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-secondary" />,
  preparing: <Truck className="w-4 h-4 text-accent" />,
  delivered: <CheckCircle className="w-4 h-4 text-green-500" />,
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  preparing: 'قيد التجهيز',
  delivered: 'تم التوصيل',
};

const ClientOrders: React.FC = () => {
  const orders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');
  const { formatPrice } = useCurrency();

  return (
    <>
      <Helmet><title>طلباتي - مطعم مزاج</title></Helmet>
      <ClientLayout title="طلباتي">
        {orders.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 shadow-card text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg text-foreground mb-2">لا توجد طلبات بعد</h3>
            <p className="text-sm text-muted-foreground">ستظهر طلباتك هنا بعد إتمام أول طلب</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any, i: number) => (
              <div key={i} className="bg-card rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm font-mono text-primary font-bold">{order.trackingNumber}</code>
                  <div className="flex items-center gap-1.5 text-xs">
                    {statusIcons[order.status || 'pending']}
                    <span className="text-muted-foreground">{statusLabels[order.status || 'pending']}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{order.date}</p>
                <div className="flex justify-between mt-2 pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">{order.itemCount} عناصر</span>
                  <span className="text-sm font-bold text-foreground">{formatPrice(order.total?.toFixed(2))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ClientLayout>
    </>
  );
};

export default ClientOrders;

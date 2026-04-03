import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, Truck, Package, XCircle, ChevronLeft, Search, Filter } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgClass: string }> = {
  pending: { icon: <Clock className="w-3.5 h-3.5" />, label: 'قيد الانتظار', color: 'text-amber-600', bgClass: 'bg-amber-500/10 border-amber-500/20' },
  confirmed: { icon: <Package className="w-3.5 h-3.5" />, label: 'مؤكد', color: 'text-primary', bgClass: 'bg-primary/10 border-primary/20' },
  preparing: { icon: <Package className="w-3.5 h-3.5" />, label: 'قيد التجهيز', color: 'text-accent', bgClass: 'bg-accent/10 border-accent/20' },
  out_for_delivery: { icon: <Truck className="w-3.5 h-3.5" />, label: 'في الطريق', color: 'text-accent', bgClass: 'bg-accent/10 border-accent/20' },
  delivered: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'تم التوصيل', color: 'text-emerald-600', bgClass: 'bg-emerald-500/10 border-emerald-500/20' },
  cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, label: 'ملغي', color: 'text-destructive', bgClass: 'bg-destructive/10 border-destructive/20' },
};

const filterTabs = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'preparing', label: 'قيد التجهيز' },
  { key: 'delivered', label: 'تم التوصيل' },
  { key: 'cancelled', label: 'ملغي' },
];

const ClientOrders: React.FC = () => {
  const orders = JSON.parse(localStorage.getItem('mazaj_client_orders') || '[]');
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order: any) => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch = !searchQuery || 
      order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item: any) => item.name?.includes(searchQuery));
    return matchesFilter && matchesSearch;
  });

  const getTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `منذ ${diffDays} يوم`;
      return date.toLocaleDateString('ar-SA');
    } catch {
      return dateStr;
    }
  };

  return (
    <ClientLayout title="طلباتي">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-card rounded-2xl p-3 text-center border border-border/30">
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">إجمالي الطلبات</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center border border-border/30">
          <p className="text-2xl font-bold text-emerald-600">
            {orders.filter((o: any) => o.status === 'delivered').length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">مكتملة</p>
        </div>
        <div className="bg-card rounded-2xl p-3 text-center border border-border/30">
          <p className="text-2xl font-bold text-amber-600">
            {orders.filter((o: any) => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">نشطة</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث برقم التتبع أو اسم الصنف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 rounded-xl bg-card border-border/30"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeFilter === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground border border-border/30 hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="font-bold text-lg text-foreground mb-1">
            {searchQuery || activeFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد طلبات بعد'}
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-[240px]">
            {searchQuery || activeFilter !== 'all' 
              ? 'جرب تغيير معايير البحث أو الفلتر'
              : 'ستظهر طلباتك هنا بعد إتمام أول طلب'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any, i: number) => {
            const status = statusConfig[order.status || 'pending'];
            const itemNames = order.items?.slice(0, 2).map((item: any) => item.name).join('، ') || '';
            const moreCount = (order.items?.length || 0) - 2;
            
            return (
              <button
                key={i}
                onClick={() => navigate(`/client/orders/${i}`)}
                className="w-full text-right bg-card rounded-2xl p-4 border border-border/30 hover:border-primary/20 hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <code className="text-xs font-mono text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-lg">
                    {order.trackingNumber}
                  </code>
                  <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color} ${status.bgClass}`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>

                {/* Items Preview */}
                <p className="text-sm text-foreground font-medium truncate mb-1">
                  {itemNames}
                  {moreCount > 0 && <span className="text-muted-foreground"> +{moreCount} أخرى</span>}
                </p>

                {/* Date */}
                <p className="text-[11px] text-muted-foreground mb-3">
                  {getTimeAgo(order.date || order.dateFormatted)}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-3 border-t border-border/20">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5" />
                    <span>{order.itemCount} عناصر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{formatPrice(order.total?.toFixed(2))}</span>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </ClientLayout>
  );
};

export default ClientOrders;

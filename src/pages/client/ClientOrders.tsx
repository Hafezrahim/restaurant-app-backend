import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, Truck, Package, XCircle, ChevronLeft, Search, CalendarDays, Loader2 } from 'lucide-react';
import { ClientLayout } from '@/components/client/ClientLayout';
import { useCurrency } from '@/context/CurrencyContext';
import { useClientAuth } from '@/context/ClientAuthContext';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string; bgClass: string }> = {
  pending: { icon: <Clock className="w-3.5 h-3.5" />, label: 'قيد الانتظار', color: 'text-amber-600', bgClass: 'bg-amber-100 dark:bg-amber-500/15' },
  confirmed: { icon: <Package className="w-3.5 h-3.5" />, label: 'مؤكد', color: 'text-primary', bgClass: 'bg-primary/10' },
  preparing: { icon: <Package className="w-3.5 h-3.5" />, label: 'قيد التجهيز', color: 'text-accent', bgClass: 'bg-accent/10' },
  out_for_delivery: { icon: <Truck className="w-3.5 h-3.5" />, label: 'في الطريق', color: 'text-accent', bgClass: 'bg-accent/10' },
  delivered: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'تم التوصيل', color: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-500/15' },
  cancelled: { icon: <XCircle className="w-3.5 h-3.5" />, label: 'ملغي', color: 'text-destructive', bgClass: 'bg-destructive/10' },
};

const filterTabs = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'قيد الانتظار' },
  { key: 'preparing', label: 'قيد التجهيز' },
  { key: 'delivered', label: 'مكتملة' },
  { key: 'cancelled', label: 'ملغية' },
];

interface OrderWithItems {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { name: string; quantity: number }[];
}

const ClientOrders: React.FC = () => {
  const { user } = useClientAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) { setOrders([]); setIsLoading(false); return; }
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, status, total, created_at, order_items(name, quantity)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setOrders(data as OrderWithItems[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Realtime subscription for status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('client-orders-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setOrders(prev => prev.map(o => 
          o.id === payload.new.id ? { ...o, ...payload.new } : o
        ));
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch = !searchQuery || 
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_items?.some((item) => item.name?.includes(searchQuery));
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

  const totalOrders = orders.length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const activeCount = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)).length;

  return (
    <ClientLayout title="طلباتي">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { value: totalOrders, label: 'إجمالي', color: 'from-primary/15 to-primary/5', textColor: 'text-primary' },
          { value: deliveredCount, label: 'مكتملة', color: 'from-emerald-500/15 to-emerald-500/5', textColor: 'text-emerald-600' },
          { value: activeCount, label: 'نشطة', color: 'from-amber-500/15 to-amber-500/5', textColor: 'text-amber-600' },
        ].map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-3.5 text-center border border-border/10`}>
            <p className={`text-2xl font-bold ${s.textColor}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="بحث برقم التتبع أو اسم الصنف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 rounded-xl bg-white dark:bg-card border-border/20 shadow-sm h-11"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 hide-scrollbar">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === tab.key
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white dark:bg-card text-muted-foreground border border-border/20 hover:border-primary/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4">
            <ShoppingBag className="w-9 h-9 text-muted-foreground/40" />
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
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status || 'pending'];
            const itemNames = order.order_items?.slice(0, 2).map((item) => item.name).join('، ') || '';
            const moreCount = (order.order_items?.length || 0) - 2;
            const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            
            return (
              <button
                key={order.id}
                onClick={() => navigate(`/client/orders/${order.id}`)}
                className="w-full text-right bg-white dark:bg-card rounded-2xl p-4 border border-border/15 hover:border-primary/25 hover:shadow-lg active:scale-[0.98] transition-all duration-200 group shadow-sm"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <code className="text-[11px] font-mono text-primary font-bold bg-primary/8 px-2.5 py-1 rounded-lg">
                    {order.order_number}
                  </code>
                  <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status?.color} ${status?.bgClass}`}>
                    {status?.icon}
                    {status?.label}
                  </div>
                </div>

                {/* Items Preview */}
                <p className="text-sm text-foreground font-semibold truncate mb-1">
                  {itemNames}
                  {moreCount > 0 && <span className="text-muted-foreground font-normal"> +{moreCount} أخرى</span>}
                </p>

                {/* Date */}
                <div className="flex items-center gap-1.5 mb-3">
                  <CalendarDays className="w-3 h-3 text-muted-foreground" />
                  <p className="text-[11px] text-muted-foreground">
                    {getTimeAgo(order.created_at)}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-3 border-t border-border/15">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="w-3.5 h-3.5" />
                    <span>{totalItems} عناصر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{formatPrice(order.total?.toFixed(2))}</span>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
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

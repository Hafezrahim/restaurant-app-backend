import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Clock, CheckCircle, Truck, XCircle, ChefHat,
  Printer, Phone, MapPin, CreditCard, ShoppingBag, Loader2,
} from "lucide-react";
import { InvoicePrint } from "@/components/admin/InvoicePrint";
import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminData";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "طلب جديد", color: "bg-destructive text-destructive-foreground", icon: Clock },
  confirmed: { label: "مؤكد", color: "bg-primary text-primary-foreground", icon: CheckCircle },
  preparing: { label: "جاري التحضير", color: "bg-secondary text-secondary-foreground", icon: ChefHat },
  out_for_delivery: { label: "في الطريق", color: "bg-primary text-primary-foreground", icon: Truck },
  delivered: { label: "تم التسليم", color: "bg-accent text-accent-foreground", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const paymentLabels: Record<string, string> = { cash: "كاش", card: "بطاقة", bank_transfer: "تحويل بنكي" };

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { data: orders = [], isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [printOrder, setPrintOrder] = useState<any>(null);

  const orderIndex = orders.findIndex((o: any) => o.id === id);
  const order = orderIndex !== -1 ? orders[orderIndex] : undefined;
  const prevOrder = orderIndex > 0 ? orders[orderIndex - 1] : null;
  const nextOrder = orderIndex < orders.length - 1 ? orders[orderIndex + 1] : null;

  const handleStatusUpdate = (newStatus: string) => {
    if (!order) return;
    updateStatus.mutate({ id: order.id, status: newStatus }, {
      onSuccess: () => toast.success("تم تحديث الحالة بنجاح"),
      onError: () => toast.error("فشل تحديث الحالة"),
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-foreground mb-2">الطلب غير موجود</h2>
          <Button onClick={() => navigate("/admin/orders")}>العودة للطلبات</Button>
        </div>
      </AdminLayout>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/orders")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">تفاصيل الطلب #{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${status.color} text-sm px-3 py-1`}>
            <StatusIcon className="w-4 h-4 ml-1" />
            {status.label}
          </Badge>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={!prevOrder} onClick={() => prevOrder && navigate(`/admin/orders/${prevOrder.id}`)} title="السابق">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!nextOrder} onClick={() => nextOrder && navigate(`/admin/orders/${nextOrder.id}`)} title="التالي">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-foreground text-lg">معلومات العميل</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {order.customer_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <span className="font-medium text-foreground">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{order.customer_phone}</span>
            </div>
            {order.delivery_address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{order.delivery_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>{paymentLabels[order.payment_method] || order.payment_method}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="w-4 h-4" />
              <Badge variant="outline">{order.delivery_address ? "توصيل" : "استلام"}</Badge>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="font-bold text-foreground text-lg mb-4">الأصناف المطلوبة</h3>
          <div className="space-y-3">
            {(order.order_items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-muted text-sm flex items-center justify-center font-bold">{item.quantity}x</span>
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{formatPrice(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 mt-6 pt-4 border-t-2 border-border">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>رسوم التوصيل</span>
              <span>{formatPrice(Number(order.delivery_fee))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>الخصم</span>
                <span>-{formatPrice(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>المجموع الكلي</span>
              <span className="text-primary">{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 flex-wrap">
        {order.status === 'pending' && (
          <Button onClick={() => handleStatusUpdate('confirmed')} disabled={updateStatus.isPending}>تأكيد الطلب</Button>
        )}
        {order.status === 'confirmed' && (
          <Button onClick={() => handleStatusUpdate('preparing')} disabled={updateStatus.isPending}>بدء التحضير</Button>
        )}
        {order.status === 'preparing' && (
          <Button onClick={() => handleStatusUpdate('out_for_delivery')} disabled={updateStatus.isPending}>في الطريق</Button>
        )}
        {order.status === 'out_for_delivery' && (
          <Button onClick={() => handleStatusUpdate('delivered')} disabled={updateStatus.isPending}>تم التسليم</Button>
        )}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Button variant="destructive" onClick={() => handleStatusUpdate('cancelled')} disabled={updateStatus.isPending}>إلغاء الطلب</Button>
        )}
        <Button variant="outline" onClick={() => setPrintOrder(order)}>
          <Printer className="w-4 h-4 ml-2" />
          طباعة الفاتورة
        </Button>
      </div>

      <InvoicePrint
        order={printOrder ? {
          ...printOrder,
          id: `#${printOrder.order_number}`,
          customer: printOrder.customer_name,
          total: String(printOrder.total),
          items: printOrder.order_items?.map((i: any) => ({ name: i.name, qty: i.quantity, price: Number(i.price) })) || [],
        } : null}
        open={!!printOrder}
        onClose={() => setPrintOrder(null)}
      />
    </AdminLayout>
  );
};

export default AdminOrderDetails;

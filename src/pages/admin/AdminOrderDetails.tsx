import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChefHat,
  Printer,
  Phone,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { InvoicePrint } from "@/components/admin/InvoicePrint";
import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

const orders = [
  { id: "#1234", customer: "محمد أحمد", phone: "0501234567", items: [{ name: "برجر كلاسيك", qty: 2, price: 35 }, { name: "بطاطس مقلية", qty: 1, price: 15 }], total: "85.00 ر.س", status: "preparing", type: "delivery", address: "حي النزهة، شارع الملك عبدالله", time: "منذ 15 دقيقة", paymentMethod: "بطاقة ائتمان" },
  { id: "#1233", customer: "فاطمة علي", phone: "0559876543", items: [{ name: "سوشي رولز", qty: 3, price: 45 }, { name: "رامن", qty: 1, price: 35 }], total: "170.00 ر.س", status: "on_way", type: "delivery", address: "حي الملقا، شارع التخصصي", time: "منذ 25 دقيقة", paymentMethod: "كاش" },
  { id: "#1232", customer: "خالد محمود", phone: "0567891234", items: [{ name: "شاورما لحم", qty: 2, price: 25 }, { name: "فتوش", qty: 1, price: 15 }], total: "65.00 ر.س", status: "delivered", type: "pickup", address: "-", time: "منذ ساعة", paymentMethod: "بطاقة ائتمان" },
  { id: "#1231", customer: "سارة عمر", phone: "0543216789", items: [{ name: "كباب مشوي", qty: 1, price: 55 }, { name: "حمص", qty: 2, price: 20 }], total: "95.00 ر.س", status: "new", type: "delivery", address: "حي الياسمين، شارع أنس بن مالك", time: "منذ 5 دقائق", paymentMethod: "كاش" },
  { id: "#1230", customer: "عبدالله حسن", phone: "0512345678", items: [{ name: "ستيك ريب آي", qty: 1, price: 150 }, { name: "سلطة سيزر", qty: 1, price: 30 }], total: "180.00 ر.س", status: "cancelled", type: "delivery", address: "حي الربوة، شارع الأمير سلطان", time: "منذ ساعتين", paymentMethod: "بطاقة ائتمان" },
];

const statusConfig = {
  new: { label: "طلب جديد", color: "bg-destructive text-destructive-foreground", icon: Clock },
  preparing: { label: "جاري التحضير", color: "bg-secondary text-secondary-foreground", icon: ChefHat },
  on_way: { label: "في الطريق", color: "bg-primary text-primary-foreground", icon: Truck },
  delivered: { label: "تم التسليم", color: "bg-accent text-accent-foreground", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const orderIndex = orders.findIndex((o) => o.id === `#${id}`);
  const order = orderIndex !== -1 ? orders[orderIndex] : undefined;
  const [printOrder, setPrintOrder] = useState<typeof orders[0] | null>(null);

  const prevOrder = orderIndex > 0 ? orders[orderIndex - 1] : null;
  const nextOrder = orderIndex < orders.length - 1 ? orders[orderIndex + 1] : null;
  const goTo = (o: typeof orders[0]) => navigate(`/admin/orders/${o.id.replace("#", "")}`);

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

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <AdminLayout>
      {/* Back button & title */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/orders")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">تفاصيل الطلب {order.id}</h1>
          <p className="text-sm text-muted-foreground">{order.time}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${status.color} text-sm px-3 py-1`}>
            <StatusIcon className="w-4 h-4 ml-1" />
            {status.label}
          </Badge>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" disabled={!prevOrder} onClick={() => prevOrder && goTo(prevOrder)} title="السابق">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!nextOrder} onClick={() => nextOrder && goTo(nextOrder)} title="التالي">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-4">
          <h3 className="font-bold text-foreground text-lg">معلومات العميل</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {order.customer.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className="font-medium text-foreground">{order.customer}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{order.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{order.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingBag className="w-4 h-4" />
              <Badge variant="outline">{order.type === "delivery" ? "توصيل" : "استلام"}</Badge>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border/50">
          <h3 className="font-bold text-foreground text-lg mb-4">الأصناف المطلوبة</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-muted text-sm flex items-center justify-center font-bold">{item.qty}x</span>
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t-2 border-border">
            <span className="text-lg font-bold text-foreground">المجموع الكلي</span>
            <span className="text-lg font-bold text-primary">{formatPrice(parseFloat(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button>تحديث الحالة</Button>
        <Button variant="outline" onClick={() => setPrintOrder(order)}>
          <Printer className="w-4 h-4 ml-2" />
          طباعة الفاتورة
        </Button>
      </div>

      <InvoicePrint order={printOrder} open={!!printOrder} onClose={() => setPrintOrder(null)} />
    </AdminLayout>
  );
};

export default AdminOrderDetails;

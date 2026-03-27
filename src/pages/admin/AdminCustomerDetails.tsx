import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, ArrowLeft, Phone, Mail, MapPin, Calendar, ShoppingBag, Star } from "lucide-react";

const customers = [
  { id: 1, name: "محمد أحمد", email: "mohammed@email.com", phone: "0501234567", address: "حي النزهة، الرياض", totalOrders: 45, totalSpent: "4,520 ر.س", avgRating: 4.8, joinDate: "15 يناير 2024", lastOrder: "منذ يومين", status: "active" },
  { id: 2, name: "فاطمة علي", email: "fatima@email.com", phone: "0559876543", address: "حي الملقا، الرياض", totalOrders: 32, totalSpent: "3,200 ر.س", avgRating: 4.5, joinDate: "20 فبراير 2024", lastOrder: "منذ أسبوع", status: "active" },
  { id: 3, name: "خالد محمود", email: "khaled@email.com", phone: "0567891234", address: "حي الياسمين، الرياض", totalOrders: 18, totalSpent: "1,890 ر.س", avgRating: 4.9, joinDate: "5 مارس 2024", lastOrder: "اليوم", status: "active" },
  { id: 4, name: "سارة عمر", email: "sara@email.com", phone: "0543216789", address: "حي الربوة، الرياض", totalOrders: 8, totalSpent: "720 ر.س", avgRating: 4.2, joinDate: "10 أبريل 2024", lastOrder: "منذ شهر", status: "inactive" },
  { id: 5, name: "عبدالله حسن", email: "abdullah@email.com", phone: "0512345678", address: "حي العليا، الرياض", totalOrders: 56, totalSpent: "8,450 ر.س", avgRating: 5.0, joinDate: "1 ديسمبر 2023", lastOrder: "أمس", status: "vip" },
  { id: 6, name: "نورة سعد", email: "noura@email.com", phone: "0534567890", address: "حي الورود، الرياض", totalOrders: 22, totalSpent: "2,100 ر.س", avgRating: 4.6, joinDate: "25 مارس 2024", lastOrder: "منذ 3 أيام", status: "active" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "bg-accent text-accent-foreground" },
  inactive: { label: "غير نشط", color: "bg-muted text-muted-foreground" },
  vip: { label: "VIP", color: "bg-secondary text-secondary-foreground" },
};

const AdminCustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerIndex = customers.findIndex((c) => c.id === Number(id));
  const customer = customerIndex !== -1 ? customers[customerIndex] : undefined;

  const prevCustomer = customerIndex > 0 ? customers[customerIndex - 1] : null;
  const nextCustomer = customerIndex < customers.length - 1 ? customers[customerIndex + 1] : null;
  const goTo = (c: typeof customers[0]) => navigate(`/admin/customers/${c.id}`);

  if (!customer) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-foreground mb-2">العميل غير موجود</h2>
          <Button onClick={() => navigate("/admin/customers")}>العودة للعملاء</Button>
        </div>
      </AdminLayout>
    );
  }

  const status = statusConfig[customer.status];

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/customers")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground flex-1">تفاصيل العميل</h1>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" disabled={!prevCustomer} onClick={() => prevCustomer && goTo(prevCustomer)} title="السابق">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" disabled={!nextCustomer} onClick={() => nextCustomer && goTo(nextCustomer)} title="التالي">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 text-center space-y-4">
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
              {customer.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
            <Badge className={`${status.color} mt-2`}>{status.label}</Badge>
          </div>
          <div className="text-sm space-y-2 text-muted-foreground text-right">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{customer.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span dir="ltr">{customer.phone}</span></div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{customer.address}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>انضم في {customer.joinDate}</span></div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" size="sm">تعديل البيانات</Button>
          </div>
        </div>

        {/* Stats & activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <ShoppingBag className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{customer.totalOrders}</p>
              <p className="text-xs text-muted-foreground">طلب</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl font-bold text-foreground">{customer.totalSpent}</p>
              <p className="text-xs text-muted-foreground">إجمالي الإنفاق</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-secondary text-secondary" />
                <span className="text-2xl font-bold text-foreground">{customer.avgRating}</span>
              </div>
              <p className="text-xs text-muted-foreground">متوسط التقييم</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-sm font-bold text-foreground">{customer.lastOrder}</p>
              <p className="text-xs text-muted-foreground">آخر طلب</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="font-bold text-foreground text-lg mb-4">آخر الطلبات</h3>
            <p className="text-muted-foreground text-sm">سيتم عرض سجل الطلبات هنا عند ربط قاعدة البيانات.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomerDetails;

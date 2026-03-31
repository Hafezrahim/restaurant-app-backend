import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, ArrowLeft, Phone, Mail, MapPin, Calendar, ShoppingBag, Loader2 } from "lucide-react";
import { useAdminCustomers, useAdminOrders } from "@/hooks/useAdminData";
import { useCurrency } from "@/context/CurrencyContext";
import { format } from "date-fns";

const AdminCustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { data: customers = [], isLoading } = useAdminCustomers();
  const { data: allOrders = [] } = useAdminOrders();

  const customerIndex = customers.findIndex((c: any) => c.id === id);
  const customer = customerIndex !== -1 ? customers[customerIndex] : undefined;
  const prevCustomer = customerIndex > 0 ? customers[customerIndex - 1] : null;
  const nextCustomer = customerIndex < customers.length - 1 ? customers[customerIndex + 1] : null;

  // Get this customer's orders
  const customerOrders = allOrders.filter((o: any) => o.user_id === id);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

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

  const initials = customer.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || '?';

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/customers")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground flex-1">تفاصيل العميل</h1>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" disabled={!prevCustomer} onClick={() => prevCustomer && navigate(`/admin/customers/${prevCustomer.id}`)} title="السابق">
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" disabled={!nextCustomer} onClick={() => nextCustomer && navigate(`/admin/customers/${nextCustomer.id}`)} title="التالي">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-card rounded-2xl p-6 border border-border/50 text-center space-y-4">
          <Avatar className="w-20 h-20 mx-auto">
            {customer.avatar_url && <AvatarImage src={customer.avatar_url} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">{customer.name || 'بدون اسم'}</h2>
            {customer.totalOrders > 10 && (
              <Badge className="bg-secondary text-secondary-foreground mt-2">VIP</Badge>
            )}
          </div>
          <div className="text-sm space-y-2 text-muted-foreground text-right">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{customer.email}</span></div>
            {customer.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span dir="ltr">{customer.phone}</span></div>}
            {customer.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{customer.address}</span></div>}
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>انضم في {format(new Date(customer.created_at), 'yyyy-MM-dd')}</span></div>
          </div>
        </div>

        {/* Stats & Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <ShoppingBag className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{customer.totalOrders}</p>
              <p className="text-xs text-muted-foreground">طلب</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl font-bold text-foreground">{formatPrice(customer.totalSpent)}</p>
              <p className="text-xs text-muted-foreground">إجمالي الإنفاق</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-sm font-bold text-foreground">
                {customer.lastOrder ? format(new Date(customer.lastOrder), 'yyyy-MM-dd') : 'لا يوجد'}
              </p>
              <p className="text-xs text-muted-foreground">آخر طلب</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <h3 className="font-bold text-foreground text-lg mb-4">آخر الطلبات</h3>
            {customerOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">لا توجد طلبات لهذا العميل</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.slice(0, 10).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">#{order.order_number}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{formatPrice(Number(order.total))}</p>
                      <Badge variant="outline" className="text-xs">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomerDetails;

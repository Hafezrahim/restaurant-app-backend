import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Phone,
  ShoppingBag,
  Star,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useCurrency } from "@/context/CurrencyContext";
import { useAdminCustomers } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminCustomers = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { data: customers = [], isLoading } = useAdminCustomers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((c: any) => 
    c.name?.includes(searchQuery) || 
    c.phone?.includes(searchQuery) ||
    c.email?.includes(searchQuery)
  );

  const handleExport = () => {
    const exportData = customers.map((customer: any) => ({
      "الاسم": customer.name,
      "البريد الإلكتروني": customer.email,
      "الهاتف": customer.phone,
      "العنوان": customer.address || "",
      "عدد الطلبات": customer.totalOrders,
      "إجمالي الإنفاق": customer.totalSpent,
      "تاريخ الانضمام": format(new Date(customer.created_at), 'yyyy-MM-dd'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "customers.xlsx");
    toast.success("تم تصدير العملاء بنجاح");
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "لا يوجد";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "اليوم";
    if (days === 1) return "أمس";
    if (days < 7) return `منذ ${days} أيام`;
    if (days < 30) return `منذ ${Math.floor(days / 7)} أسبوع`;
    return `منذ ${Math.floor(days / 30)} شهر`;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة العملاء</h1>
          <p className="text-muted-foreground">عرض وإدارة بيانات العملاء ({customers.length} عميل)</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث بالاسم أو الهاتف..." 
              className="pr-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
          <p className="text-2xl font-bold text-foreground mt-1">{customers.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">لديهم طلبات</p>
          <p className="text-2xl font-bold text-accent mt-1">
            {customers.filter((c: any) => c.totalOrders > 0).length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">إجمالي الإنفاق</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            {formatPrice(customers.reduce((s: number, c: any) => s + c.totalSpent, 0))}
          </p>
        </div>
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer: any) => (
            <div 
              key={customer.id}
              className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-elevated transition-all cursor-pointer"
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {customer.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{customer.name || 'بدون اسم'}</h3>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                {customer.totalOrders > 10 && (
                  <Badge className="bg-secondary text-secondary-foreground">VIP</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{customer.totalOrders} طلب</span>
                  <span className="mr-auto font-semibold text-foreground">{formatPrice(customer.totalSpent)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <span className="text-xs text-muted-foreground">
                  انضم: {format(new Date(customer.created_at), 'yyyy-MM-dd')}
                </span>
                <span className="text-xs text-muted-foreground">آخر طلب: {getTimeAgo(customer.lastOrder)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCustomers;

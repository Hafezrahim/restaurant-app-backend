import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  MoreVertical,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChefHat,
  Download,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoicePrint } from "@/components/admin/InvoicePrint";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useCurrency } from "@/context/CurrencyContext";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdminData";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "طلب جديد", color: "bg-destructive text-destructive-foreground", icon: Clock },
  confirmed: { label: "مؤكد", color: "bg-primary text-primary-foreground", icon: CheckCircle },
  preparing: { label: "جاري التحضير", color: "bg-secondary text-secondary-foreground", icon: ChefHat },
  out_for_delivery: { label: "في الطريق", color: "bg-primary text-primary-foreground", icon: Truck },
  delivered: { label: "تم التسليم", color: "bg-accent text-accent-foreground", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const AdminOrders = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [printOrder, setPrintOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOrders = orders.filter((o: any) => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch = !searchQuery || 
      o.order_number?.includes(searchQuery) || 
      o.customer_name?.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const exportData = orders.map((order: any) => ({
      "رقم الطلب": order.order_number,
      "العميل": order.customer_name,
      "الهاتف": order.customer_phone,
      "الأصناف": order.order_items?.map((i: any) => `${i.name} (${i.quantity})`).join("، ") || "",
      "المجموع": order.total,
      "الحالة": statusConfig[order.status]?.label || order.status,
      "طريقة الدفع": order.payment_method,
      "التاريخ": format(new Date(order.created_at), 'yyyy-MM-dd HH:mm'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلبات");
    XLSX.writeFile(wb, "orders.xlsx");
    toast.success("تم تصدير الطلبات بنجاح");
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatus.mutate({ id: orderId, status: newStatus }, {
      onSuccess: () => toast.success("تم تحديث الحالة بنجاح"),
      onError: () => toast.error("فشل تحديث الحالة"),
    });
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground">متابعة وإدارة جميع الطلبات ({orders.length} طلب)</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث برقم الطلب..." 
              className="pr-10 w-64" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = orders.filter((o: any) => o.status === key).length;
          const Icon = config.icon;
          return (
            <div 
              key={key}
              className="bg-card rounded-xl p-4 border border-border/50 cursor-pointer hover:shadow-md transition-all"
              onClick={() => setFilterStatus(key)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">رقم الطلب</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">العميل</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">طريقة الدفع</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">المجموع</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">الوقت</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد طلبات</td></tr>
              ) : (
                filteredOrders.map((order: any) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const paymentLabels: Record<string, string> = { cash: "كاش", card: "بطاقة", bank_transfer: "تحويل بنكي" };
                  return (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      <td className="p-4 font-bold text-primary">#{order.order_number}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{order.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <Badge variant="outline">
                          {paymentLabels[order.payment_method] || order.payment_method}
                        </Badge>
                      </td>
                      <td className="p-4 font-semibold text-foreground">{formatPrice(Number(order.total))}</td>
                      <td className="p-4">
                        <Badge className={status.color}>{status.label}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">{getTimeAgo(order.created_at)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => setPrintOrder(order)}>
                                <Printer className="w-4 h-4 ml-2" />
                                طباعة الفاتورة
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'preparing')}>جاري التحضير</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}>في الطريق</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')}>تم التسليم</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleStatusUpdate(order.id, 'cancelled')}>إلغاء الطلب</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>تفاصيل الطلب #{selectedOrder?.order_number}</span>
              {selectedOrder && (
                <Badge className={statusConfig[selectedOrder.status]?.color}>
                  {statusConfig[selectedOrder.status]?.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-3">معلومات العميل</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span className="font-medium" dir="ltr">{selectedOrder.customer_phone}</span>
                  </div>
                  {selectedOrder.delivery_address && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">العنوان:</span>
                      <span className="font-medium">{selectedOrder.delivery_address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-3">الأصناف</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-muted text-xs flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(Number(selectedOrder.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>رسوم التوصيل</span>
                    <span>{formatPrice(Number(selectedOrder.delivery_fee))}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>الخصم</span>
                      <span>-{formatPrice(Number(selectedOrder.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>المجموع</span>
                    <span className="text-primary">{formatPrice(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Print Dialog */}
      <InvoicePrint 
        order={printOrder ? { ...printOrder, id: `#${printOrder.order_number}`, customer: printOrder.customer_name, total: String(printOrder.total), items: printOrder.order_items?.map((i: any) => ({ name: i.name, qty: i.quantity, price: Number(i.price) })) || [] } : null} 
        open={!!printOrder} 
        onClose={() => setPrintOrder(null)} 
      />
    </AdminLayout>
  );
};

export default AdminOrders;

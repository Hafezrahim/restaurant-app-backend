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

const initialOrders = [
  { 
    id: "#1234", 
    customer: "محمد أحمد",
    phone: "0501234567",
    items: [
      { name: "برجر كلاسيك", qty: 2, price: 35 },
      { name: "بطاطس مقلية", qty: 1, price: 15 }
    ],
    total: 85.00, 
    status: "preparing",
    type: "delivery",
    address: "حي النزهة، شارع الملك عبدالله",
    time: "منذ 15 دقيقة",
    paymentMethod: "بطاقة ائتمان"
  },
  { 
    id: "#1233", 
    customer: "فاطمة علي",
    phone: "0559876543",
    items: [
      { name: "سوشي رولز", qty: 3, price: 45 },
      { name: "رامن", qty: 1, price: 35 }
    ],
    total: 170.00, 
    status: "on_way",
    type: "delivery",
    address: "حي الملقا، شارع التخصصي",
    time: "منذ 25 دقيقة",
    paymentMethod: "كاش"
  },
  { 
    id: "#1232", 
    customer: "خالد محمود",
    phone: "0567891234",
    items: [
      { name: "شاورما لحم", qty: 2, price: 25 },
      { name: "فتوش", qty: 1, price: 15 }
    ],
    total: 65.00, 
    status: "delivered",
    type: "pickup",
    address: "-",
    time: "منذ ساعة",
    paymentMethod: "بطاقة ائتمان"
  },
  { 
    id: "#1231", 
    customer: "سارة عمر",
    phone: "0543216789",
    items: [
      { name: "كباب مشوي", qty: 1, price: 55 },
      { name: "حمص", qty: 2, price: 20 }
    ],
    total: 95.00, 
    status: "new",
    type: "delivery",
    address: "حي الياسمين، شارع أنس بن مالك",
    time: "منذ 5 دقائق",
    paymentMethod: "كاش"
  },
  { 
    id: "#1230", 
    customer: "عبدالله حسن",
    phone: "0512345678",
    items: [
      { name: "ستيك ريب آي", qty: 1, price: 150 },
      { name: "سلطة سيزر", qty: 1, price: 30 }
    ],
    total: 180.00, 
    status: "cancelled",
    type: "delivery",
    address: "حي الربوة، شارع الأمير سلطان",
    time: "منذ ساعتين",
    paymentMethod: "بطاقة ائتمان"
  },
];

const statusConfig = {
  new: { label: "طلب جديد", color: "bg-destructive text-destructive-foreground", icon: Clock },
  preparing: { label: "جاري التحضير", color: "bg-secondary text-secondary-foreground", icon: ChefHat },
  on_way: { label: "في الطريق", color: "bg-primary text-primary-foreground", icon: Truck },
  delivered: { label: "تم التسليم", color: "bg-accent text-accent-foreground", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-muted text-muted-foreground", icon: XCircle },
};

const AdminOrders = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [printOrder, setPrintOrder] = useState<typeof initialOrders[0] | null>(null);
  const [orders, setOrders] = useState(initialOrders);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const handleExport = () => {
    const exportData = orders.map(order => ({
      "رقم الطلب": order.id,
      "العميل": order.customer,
      "الهاتف": order.phone,
      "الأصناف": order.items.map(i => `${i.name} (${i.qty})`).join("، "),
      "المجموع": order.total,
      "الحالة": statusConfig[order.status as keyof typeof statusConfig]?.label || order.status,
      "النوع": order.type === "delivery" ? "توصيل" : "استلام",
      "العنوان": order.address,
      "طريقة الدفع": order.paymentMethod,
      "الوقت": order.time
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 40 },
      { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 35 },
      { wch: 15 }, { wch: 15 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلبات");
    XLSX.writeFile(wb, "orders.xlsx");
    toast.success("تم تصدير الطلبات بنجاح");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const statusMap: Record<string, string> = {
        "طلب جديد": "new",
        "جاري التحضير": "preparing",
        "في الطريق": "on_way",
        "تم التسليم": "delivered",
        "ملغي": "cancelled"
      };

      const imported = jsonData.map((row: any) => ({
        id: row["رقم الطلب"] || `#${Date.now()}`,
        customer: row["العميل"] || "",
        phone: row["الهاتف"] || "",
        items: [],
        total: parseFloat(row["المجموع"]) || 0,
        status: statusMap[row["الحالة"]] || "new",
        type: row["النوع"] === "توصيل" ? "delivery" : "pickup",
        address: row["العنوان"] || "-",
        time: row["الوقت"] || "الآن",
        paymentMethod: row["طريقة الدفع"] || "كاش"
      }));

      setOrders(imported);
      toast.success(`تم استيراد ${imported.length} طلب بنجاح`);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const template = [{
      "رقم الطلب": "#0001",
      "العميل": "اسم العميل",
      "الهاتف": "0500000000",
      "الأصناف": "صنف 1، صنف 2",
      "المجموع": "100 ر.س",
      "الحالة": "طلب جديد",
      "النوع": "توصيل",
      "العنوان": "العنوان هنا",
      "طريقة الدفع": "كاش",
      "الوقت": "الآن"
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قالب الطلبات");
    XLSX.writeFile(wb, "orders_template.xlsx");
    toast.success("تم تحميل القالب");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground">متابعة وإدارة جميع الطلبات</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث برقم الطلب..." className="pr-10 w-64" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="new">طلب جديد</SelectItem>
              <SelectItem value="preparing">جاري التحضير</SelectItem>
              <SelectItem value="on_way">في الطريق</SelectItem>
              <SelectItem value="delivered">تم التسليم</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <FileSpreadsheet className="w-4 h-4 ml-2" />
            قالب
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = orders.filter(o => o.status === key).length;
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
                <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">النوع</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">المجموع</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">الحالة</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">الوقت</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig];
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id.replace('#', '')}`)}>
                    <td className="p-4 font-bold text-primary">{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <Badge variant="outline">
                        {order.type === "delivery" ? "توصيل" : "استلام"}
                      </Badge>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <Badge className={status.color}>{status.label}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">{order.time}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setPrintOrder(order)}>
                              <Printer className="w-4 h-4 ml-2" />
                              طباعة الفاتورة
                            </DropdownMenuItem>
                            <DropdownMenuItem>تحديث الحالة</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">إلغاء الطلب</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>تفاصيل الطلب {selectedOrder?.id}</span>
              {selectedOrder && (
                <Badge className={statusConfig[selectedOrder.status as keyof typeof statusConfig].color}>
                  {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-3">معلومات العميل</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{selectedOrder.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span className="font-medium" dir="ltr">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">العنوان:</span>
                    <span className="font-medium">{selectedOrder.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">الأصناف</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-muted text-xs flex items-center justify-center">
                          {item.qty}x
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.price * item.qty} ر.س</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-border">
                  <span className="font-bold">المجموع</span>
                  <span className="font-bold text-primary">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1">تحديث الحالة</Button>
                <Button variant="outline" className="flex-1" onClick={() => {
                  setSelectedOrder(null);
                  setPrintOrder(selectedOrder);
                }}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice Print Dialog */}
      <InvoicePrint 
        order={printOrder ? { ...printOrder, total: String(printOrder.total) } : null} 
        open={!!printOrder} 
        onClose={() => setPrintOrder(null)} 
      />
    </AdminLayout>
  );
};

export default AdminOrders;

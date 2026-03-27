import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  UserPlus, 
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Star,
  Calendar,
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
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useCurrency } from "@/context/CurrencyContext";

const initialCustomers = [
  { 
    id: 1,
    name: "محمد أحمد",
    email: "mohammed@email.com",
    phone: "0501234567",
    address: "حي النزهة، الرياض",
    totalOrders: 45,
    totalSpent: "4,520 ر.س",
    avgRating: 4.8,
    joinDate: "15 يناير 2024",
    lastOrder: "منذ يومين",
    status: "active"
  },
  { 
    id: 2,
    name: "فاطمة علي",
    email: "fatima@email.com",
    phone: "0559876543",
    address: "حي الملقا، الرياض",
    totalOrders: 32,
    totalSpent: "3,200 ر.س",
    avgRating: 4.5,
    joinDate: "20 فبراير 2024",
    lastOrder: "منذ أسبوع",
    status: "active"
  },
  { 
    id: 3,
    name: "خالد محمود",
    email: "khaled@email.com",
    phone: "0567891234",
    address: "حي الياسمين، الرياض",
    totalOrders: 18,
    totalSpent: "1,890 ر.س",
    avgRating: 4.9,
    joinDate: "5 مارس 2024",
    lastOrder: "اليوم",
    status: "active"
  },
  { 
    id: 4,
    name: "سارة عمر",
    email: "sara@email.com",
    phone: "0543216789",
    address: "حي الربوة، الرياض",
    totalOrders: 8,
    totalSpent: "720 ر.س",
    avgRating: 4.2,
    joinDate: "10 أبريل 2024",
    lastOrder: "منذ شهر",
    status: "inactive"
  },
  { 
    id: 5,
    name: "عبدالله حسن",
    email: "abdullah@email.com",
    phone: "0512345678",
    address: "حي العليا، الرياض",
    totalOrders: 56,
    totalSpent: "8,450 ر.س",
    avgRating: 5.0,
    joinDate: "1 ديسمبر 2023",
    lastOrder: "أمس",
    status: "vip"
  },
  { 
    id: 6,
    name: "نورة سعد",
    email: "noura@email.com",
    phone: "0534567890",
    address: "حي الورود، الرياض",
    totalOrders: 22,
    totalSpent: "2,100 ر.س",
    avgRating: 4.6,
    joinDate: "25 مارس 2024",
    lastOrder: "منذ 3 أيام",
    status: "active"
  },
];

const statusConfig = {
  active: { label: "نشط", color: "bg-accent text-accent-foreground" },
  inactive: { label: "غير نشط", color: "bg-muted text-muted-foreground" },
  vip: { label: "VIP", color: "bg-secondary text-secondary-foreground" },
};

const AdminCustomers = () => {
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<typeof initialCustomers[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.includes(searchQuery) || 
    c.phone.includes(searchQuery) ||
    c.email.includes(searchQuery)
  );

  const handleExport = () => {
    const exportData = customers.map(customer => ({
      "الاسم": customer.name,
      "البريد الإلكتروني": customer.email,
      "الهاتف": customer.phone,
      "العنوان": customer.address,
      "عدد الطلبات": customer.totalOrders,
      "إجمالي الإنفاق": customer.totalSpent,
      "متوسط التقييم": customer.avgRating,
      "تاريخ الانضمام": customer.joinDate,
      "آخر طلب": customer.lastOrder,
      "الحالة": statusConfig[customer.status as keyof typeof statusConfig]?.label || customer.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 30 },
      { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 18 },
      { wch: 15 }, { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, "customers.xlsx");
    toast.success("تم تصدير العملاء بنجاح");
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
        "نشط": "active",
        "غير نشط": "inactive",
        "VIP": "vip"
      };

      const imported = jsonData.map((row: any, index: number) => ({
        id: index + 1,
        name: row["الاسم"] || "",
        email: row["البريد الإلكتروني"] || "",
        phone: row["الهاتف"] || "",
        address: row["العنوان"] || "",
        totalOrders: parseInt(row["عدد الطلبات"]) || 0,
        totalSpent: row["إجمالي الإنفاق"] || "0 ر.س",
        avgRating: parseFloat(row["متوسط التقييم"]) || 0,
        joinDate: row["تاريخ الانضمام"] || "",
        lastOrder: row["آخر طلب"] || "",
        status: statusMap[row["الحالة"]] || "active"
      }));

      setCustomers(imported);
      toast.success(`تم استيراد ${imported.length} عميل بنجاح`);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const template = [{
      "الاسم": "اسم العميل",
      "البريد الإلكتروني": "email@example.com",
      "الهاتف": "0500000000",
      "العنوان": "العنوان هنا",
      "عدد الطلبات": 10,
      "إجمالي الإنفاق": "1000 ر.س",
      "متوسط التقييم": 4.5,
      "تاريخ الانضمام": "1 يناير 2024",
      "آخر طلب": "اليوم",
      "الحالة": "نشط"
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قالب العملاء");
    XLSX.writeFile(wb, "customers_template.xlsx");
    toast.success("تم تحميل القالب");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة العملاء</h1>
          <p className="text-muted-foreground">عرض وإدارة بيانات العملاء</p>
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
          <Button>
            <UserPlus className="w-4 h-4 ml-2" />
            إضافة عميل
          </Button>
          
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
          <p className="text-2xl font-bold text-foreground mt-1">{customers.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">العملاء النشطين</p>
          <p className="text-2xl font-bold text-accent mt-1">
            {customers.filter(c => c.status !== "inactive").length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">عملاء VIP</p>
          <p className="text-2xl font-bold text-secondary mt-1">
            {customers.filter(c => c.status === "vip").length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-sm text-muted-foreground">متوسط التقييم</p>
          <p className="text-2xl font-bold text-foreground mt-1 flex items-center gap-1">
            4.7 <Star className="w-4 h-4 fill-secondary text-secondary" />
          </p>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => {
          const status = statusConfig[customer.status as keyof typeof statusConfig];
          return (
            <div 
              key={customer.id}
              className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-elevated transition-all cursor-pointer"
              onClick={() => navigate(`/admin/customers/${customer.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-foreground">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                  </div>
                </div>
                <Badge className={status.color}>{status.label}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{customer.totalOrders} طلب</span>
                  <span className="mr-auto font-semibold text-foreground">{customer.totalSpent}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="font-medium">{customer.avgRating}</span>
                </div>
                <span className="text-xs text-muted-foreground">آخر طلب: {customer.lastOrder}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedCustomer.name}</h3>
                  <Badge className={statusConfig[selectedCustomer.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedCustomer.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span dir="ltr">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{selectedCustomer.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span>انضم في {selectedCustomer.joinDate}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-xl">
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">طلب</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-xl">
                  <p className="text-2xl font-bold text-foreground">{selectedCustomer.totalSpent}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الإنفاق</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-xl">
                  <p className="text-2xl font-bold text-secondary flex items-center justify-center gap-1">
                    {selectedCustomer.avgRating}
                    <Star className="w-4 h-4 fill-secondary" />
                  </p>
                  <p className="text-xs text-muted-foreground">التقييم</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1">عرض الطلبات</Button>
                <Button variant="outline" className="flex-1">تعديل البيانات</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomers;

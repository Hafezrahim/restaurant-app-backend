import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/context/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const orders = [
  { 
    id: "#1234", 
    customer: "محمد أحمد", 
    items: "برجر كلاسيك، بيتزا مارغريتا", 
    total: 85.00, 
    status: "جاري التحضير",
    statusColor: "bg-secondary text-secondary-foreground" 
  },
  { 
    id: "#1233", 
    customer: "فاطمة علي", 
    items: "سوشي رولز، رامن", 
    total: 120.00, 
    status: "في الطريق",
    statusColor: "bg-primary text-primary-foreground" 
  },
  { 
    id: "#1232", 
    customer: "خالد محمود", 
    items: "شاورما لحم، فتوش", 
    total: 65.00, 
    status: "تم التسليم",
    statusColor: "bg-accent text-accent-foreground" 
  },
  { 
    id: "#1231", 
    customer: "سارة عمر", 
    items: "كباب مشوي، حمص", 
    total: 95.00, 
    status: "جاري التحضير",
    statusColor: "bg-secondary text-secondary-foreground" 
  },
  { 
    id: "#1230", 
    customer: "عبدالله حسن", 
    items: "ستيك ريب آي، سلطة سيزر", 
    total: 180.00, 
    status: "طلب جديد",
    statusColor: "bg-destructive text-destructive-foreground" 
  },
];

export const RecentOrders = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">آخر الطلبات</h3>
          <p className="text-sm text-muted-foreground">متابعة الطلبات الأخيرة</p>
        </div>
        <Button variant="outline" size="sm">
          عرض الكل
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">رقم الطلب</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">العميل</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">الأصناف</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">المجموع</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">الحالة</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate("/admin/orders")}>
                <td className="p-4 font-medium text-foreground">{order.id}</td>
                <td className="p-4 text-foreground">{order.customer}</td>
                <td className="p-4 text-muted-foreground text-sm hidden md:table-cell max-w-[200px] truncate">
                  {order.items}
                </td>
                <td className="p-4 font-semibold text-foreground">{formatPrice(order.total)}</td>
                <td className="p-4">
                  <Badge className={order.statusColor}>
                    {order.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem>تحديث الحالة</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">إلغاء الطلب</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

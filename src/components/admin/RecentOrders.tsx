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

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "طلب جديد", color: "bg-destructive text-destructive-foreground" },
  confirmed: { label: "مؤكد", color: "bg-primary text-primary-foreground" },
  preparing: { label: "جاري التحضير", color: "bg-secondary text-secondary-foreground" },
  out_for_delivery: { label: "في الطريق", color: "bg-primary text-primary-foreground" },
  delivered: { label: "تم التسليم", color: "bg-accent text-accent-foreground" },
  cancelled: { label: "ملغي", color: "bg-muted text-muted-foreground" },
};

interface RecentOrdersProps {
  orders?: any[];
}

export const RecentOrders = ({ orders }: RecentOrdersProps) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const displayOrders = orders || [];

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">آخر الطلبات</h3>
          <p className="text-sm text-muted-foreground">متابعة الطلبات الأخيرة</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
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
            {displayOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  لا توجد طلبات بعد
                </td>
              </tr>
            ) : (
              displayOrders.map((order) => {
                const status = statusMap[order.status] || statusMap.pending;
                const itemNames = order.order_items?.map((i: any) => i.name).join('، ') || '';
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => navigate("/admin/orders")}>
                    <td className="p-4 font-medium text-foreground">#{order.order_number}</td>
                    <td className="p-4 text-foreground">{order.customer_name}</td>
                    <td className="p-4 text-muted-foreground text-sm hidden md:table-cell max-w-[200px] truncate">
                      {itemNames}
                    </td>
                    <td className="p-4 font-semibold text-foreground">{formatPrice(Number(order.total))}</td>
                    <td className="p-4">
                      <Badge className={status.color}>
                        {status.label}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

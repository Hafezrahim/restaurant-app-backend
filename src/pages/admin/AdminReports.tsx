import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useAdminOrders, useAdminCustomers, useAdminReservations } from "@/hooks/useAdminData";
import { useMemo } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const chartConfig = {
  sales: { label: "المبيعات", color: "hsl(var(--primary))" },
  orders: { label: "الطلبات", color: "hsl(var(--chart-2))" },
};

const AdminReports = () => {
  const { formatPrice } = useCurrency();
  const { data: orders = [] } = useAdminOrders();
  const { data: customers = [] } = useAdminCustomers();
  const { data: reservations = [] } = useAdminReservations();

  const stats = useMemo(() => {
    const totalSales = orders.reduce((s: number, o: any) => s + Number(o.total), 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const totalReservations = reservations.length;

    // Monthly sales
    const monthlyData: Record<string, { month: string; sales: number; orders: number }> = {};
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    orders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: monthNames[d.getMonth()], sales: 0, orders: 0 };
      }
      monthlyData[key].sales += Number(o.total);
      monthlyData[key].orders++;
    });

    // Category distribution from order items
    const catData: Record<string, number> = {};
    orders.forEach((o: any) => {
      o.order_items?.forEach((item: any) => {
        const name = item.name;
        catData[name] = (catData[name] || 0) + Number(item.price) * item.quantity;
      });
    });
    
    const topItems = Object.entries(catData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));

    // Status distribution  
    const statusCounts: Record<string, number> = {};
    orders.forEach((o: any) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const statusLabels: Record<string, string> = {
      pending: 'جديد', confirmed: 'مؤكد', preparing: 'تحضير', 
      out_for_delivery: 'توصيل', delivered: 'مسلم', cancelled: 'ملغي'
    };
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));

    return {
      totalSales, totalOrders, totalCustomers, totalReservations,
      monthlyChart: Object.values(monthlyData).slice(-6),
      topItems, statusData,
    };
  }, [orders, customers, reservations]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--accent))"];

  const handleExport = () => {
    const data = orders.map((o: any) => ({
      "رقم الطلب": o.order_number,
      "العميل": o.customer_name,
      "المجموع": o.total,
      "الحالة": o.status,
      "التاريخ": o.created_at,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "التقرير");
    XLSX.writeFile(wb, "report.xlsx");
    toast.success("تم تصدير التقرير");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>
            <p className="text-muted-foreground">تحليل شامل لأداء المطعم</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold">{formatPrice(stats.totalSales)}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">العملاء</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الحجوزات</p>
                  <p className="text-2xl font-bold">{stats.totalReservations}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>المبيعات الشهرية</CardTitle></CardHeader>
            <CardContent>
              {stats.monthlyChart.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={stats.monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-center py-12 text-muted-foreground">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>توزيع حالات الطلبات</CardTitle></CardHeader>
            <CardContent>
              {stats.statusData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {stats.statusData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value: string) => <span className="text-foreground text-sm">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">لا توجد بيانات</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle>الأصناف الأكثر مبيعاً</CardTitle></CardHeader>
          <CardContent>
            {stats.topItems.length > 0 ? (
              <div className="space-y-4">
                {stats.topItems.map((item: any, index: number) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{index + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <p className="font-bold text-primary">{formatPrice(item.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

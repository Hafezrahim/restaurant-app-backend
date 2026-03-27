import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/CurrencyContext";

const salesData = [
  { month: "يناير", sales: 45000, orders: 120 },
  { month: "فبراير", sales: 52000, orders: 145 },
  { month: "مارس", sales: 48000, orders: 132 },
  { month: "أبريل", sales: 61000, orders: 168 },
  { month: "مايو", sales: 55000, orders: 152 },
  { month: "يونيو", sales: 67000, orders: 185 },
];

const dailySalesData = [
  { day: "السبت", sales: 8500 },
  { day: "الأحد", sales: 9200 },
  { day: "الإثنين", sales: 7800 },
  { day: "الثلاثاء", sales: 8100 },
  { day: "الأربعاء", sales: 9500 },
  { day: "الخميس", sales: 11200 },
  { day: "الجمعة", sales: 12500 },
];

const categoryData = [
  { name: "المشاوي", value: 35, color: "hsl(var(--primary))" },
  { name: "المقبلات", value: 20, color: "hsl(var(--chart-2))" },
  { name: "المشروبات", value: 15, color: "hsl(var(--chart-3))" },
  { name: "الحلويات", value: 18, color: "hsl(var(--chart-4))" },
  { name: "الأطباق الرئيسية", value: 12, color: "hsl(var(--chart-5))" },
];

const topProducts = [
  { name: "مشاوي مشكلة", sales: 245, revenue: 12250 },
  { name: "كباب لحم", sales: 189, revenue: 7560 },
  { name: "شاورما عربي", sales: 167, revenue: 5010 },
  { name: "فتة حمص", sales: 145, revenue: 2900 },
  { name: "كنافة نابلسية", sales: 132, revenue: 3960 },
];

const chartConfig = {
  sales: {
    label: "المبيعات",
    color: "hsl(var(--primary))",
  },
  orders: {
    label: "الطلبات",
    color: "hsl(var(--chart-2))",
  },
};

const AdminReports = () => {
  const [period, setPeriod] = useState("month");
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const exportReport = (format: string) => {
    toast({
      title: "جاري التصدير",
      description: `جاري تصدير التقرير بصيغة ${format}...`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>
            <p className="text-muted-foreground">تحليل شامل لأداء المطعم</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">هذا الربع</SelectItem>
                <SelectItem value="year">هذا العام</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => exportReport("PDF")}>
              <Download className="w-4 h-4 ml-2" />
              تصدير PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport("Excel")}>
              <FileText className="w-4 h-4 ml-2" />
              تصدير Excel
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold">{formatPrice(328000)}</p>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5%</span>
                  </div>
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
                  <p className="text-2xl font-bold">902</p>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+8.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">عملاء جدد</p>
                  <p className="text-2xl font-bold">156</p>
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    <span>-3.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الحجوزات</p>
                  <p className="text-2xl font-bold">89</p>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+15.7%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Daily Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>مبيعات الأسبوع</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-sales)", strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المبيعات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      formatter={(value: string) => (
                        <span className="text-foreground text-sm">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>الأطباق الأكثر مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales} طلب
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-primary">
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه الطلبات والمبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  name="المبيعات"
                  stroke="var(--color-sales)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="الطلبات"
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

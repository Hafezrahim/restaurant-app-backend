import { ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { PopularDishes } from "@/components/admin/PopularDishes";
import { SalesChart } from "@/components/admin/SalesChart";
import { useCurrency } from "@/context/CurrencyContext";



const AdminDashboard = () => {
  const { formatPrice } = useCurrency();

  const stats = [
    {
      title: "إجمالي الطلبات اليوم",
      value: "156",
      change: "+23%",
      changeType: "positive" as const,
      icon: ShoppingBag,
      iconBg: "gradient-warm"
    },
    {
      title: "إجمالي المبيعات",
      value: formatPrice(12450),
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
      iconBg: "bg-accent"
    },
    {
      title: "العملاء الجدد",
      value: "48",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      iconBg: "bg-secondary"
    },
    {
      title: "معدل النمو",
      value: "15.8%",
      change: "-2%",
      changeType: "negative" as const,
      icon: TrendingUp,
      iconBg: "bg-primary"
    },
  ];
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminSidebar />
      
      <div className="mr-64 transition-all duration-300">
        <AdminHeader />
        
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-l from-primary/10 via-secondary/5 to-transparent rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-foreground">مرحباً، أحمد 👋</h1>
            <p className="text-muted-foreground mt-1">
              إليك ملخص أداء مطعمك اليوم
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Charts & Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart />
            </div>
            <PopularDishes />
          </div>

          {/* Recent Orders */}
          <RecentOrders />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

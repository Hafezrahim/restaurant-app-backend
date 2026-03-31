import { ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { PopularDishes } from "@/components/admin/PopularDishes";
import { SalesChart } from "@/components/admin/SalesChart";
import { useCurrency } from "@/context/CurrencyContext";
import { useDashboardStats } from "@/hooks/useAdminData";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const { data: stats, isLoading } = useDashboardStats();
  const { user } = useAdminAuth();

  const displayName = user?.email?.split('@')[0] || 'المدير';

  const statCards = [
    {
      title: "إجمالي الطلبات اليوم",
      value: String(stats?.todayOrders || 0),
      change: `${(stats?.ordersChange || 0) >= 0 ? '+' : ''}${stats?.ordersChange || 0}%`,
      changeType: (stats?.ordersChange || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: ShoppingBag,
      iconBg: "gradient-warm"
    },
    {
      title: "إجمالي المبيعات",
      value: formatPrice(stats?.todaySales || 0),
      change: `${(stats?.salesChange || 0) >= 0 ? '+' : ''}${stats?.salesChange || 0}%`,
      changeType: (stats?.salesChange || 0) >= 0 ? "positive" as const : "negative" as const,
      icon: DollarSign,
      iconBg: "bg-accent"
    },
    {
      title: "إجمالي العملاء",
      value: String(stats?.totalCustomers || 0),
      change: "",
      changeType: "neutral" as const,
      icon: Users,
      iconBg: "bg-secondary"
    },
    {
      title: "طلبات الأمس",
      value: String(stats?.yesterdayOrders || 0),
      change: formatPrice(stats?.yesterdaySales || 0),
      changeType: "neutral" as const,
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
          <div className="bg-gradient-to-l from-primary/10 via-secondary/5 to-transparent rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-foreground">مرحباً، {displayName} 👋</h1>
            <p className="text-muted-foreground mt-1">
              إليك ملخص أداء مطعمك اليوم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart data={stats?.weeklyChart} />
            </div>
            <PopularDishes items={stats?.popularItems} />
          </div>

          <RecentOrders orders={stats?.recentOrders} />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

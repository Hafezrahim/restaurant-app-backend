import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  UtensilsCrossed,
  ClipboardList,
  Settings,
  BarChart3,
  MessageSquare,
  Calendar,
  Ticket,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Bell,
  Search,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { 
    title: "لوحة التحكم", 
    icon: LayoutDashboard, 
    path: "/admin",
    badge: null 
  },
  { 
    title: "الطلبات", 
    icon: ShoppingBag, 
    path: "/admin/orders",
    badge: "12" 
  },
  { 
    title: "القائمة", 
    icon: UtensilsCrossed, 
    path: "/admin/menu",
    badge: null 
  },
  { 
    title: "العملاء", 
    icon: Users, 
    path: "/admin/customers",
    badge: null 
  },
  { 
    title: "الحجوزات", 
    icon: Calendar, 
    path: "/admin/reservations",
    badge: "5" 
  },
  { 
    title: "التقارير", 
    icon: BarChart3, 
    path: "/admin/reports",
    badge: null 
  },
  { 
    title: "التقييمات", 
    icon: MessageSquare, 
    path: "/admin/reviews",
    badge: "3" 
  },
  { 
    title: "الكوبونات", 
    icon: Ticket, 
    path: "/admin/coupons",
    badge: null 
  },
  {
    title: "تحسين محركات البحث",
    icon: Search,
    path: "/admin/seo",
    badge: null
  },
  { 
    title: "الإعدادات", 
    icon: Settings, 
    path: "/admin/settings",
    badge: null 
  },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <aside 
      className={cn(
        "fixed right-0 top-0 z-40 h-screen bg-card border-l border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">المطعم</h2>
                <p className="text-xs text-muted-foreground">لوحة الإدارة</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center mx-auto">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -left-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-md hover:bg-muted"
      >
        {collapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                collapsed && "mx-auto"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1 font-medium">{item.title}</span>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute left-0 top-0 w-2 h-2 bg-destructive rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl bg-muted/50",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground">أحمد محمد</p>
              <p className="text-xs text-muted-foreground">مدير النظام</p>
            </div>
          )}
        </div>
        
        <Button
          variant="ghost"
          className={cn(
            "w-full mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed ? "px-0" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("w-5 h-5", !collapsed && "ml-2")} />
          {!collapsed && "تسجيل الخروج"}
        </Button>
      </div>
    </aside>
  );
};

import { useState, useCallback, useEffect } from "react";
import { Bell, Package, Calendar, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeAdmin, type RealtimeNotification } from "@/hooks/useRealtimeAdmin";
import { useNavigate } from "react-router-dom";

const READ_KEY = "admin-read-notifications";

const getReadIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
};

const persistReadIds = (ids: string[]) => {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids.slice(0, 200)));
  } catch {}
};

export const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleNewNotification = useCallback((n: RealtimeNotification) => {
    setNotifications((prev) => [n, ...prev.filter((p) => p.id !== n.id).slice(0, 19)]);
  }, []);

  useRealtimeAdmin(handleNewNotification);

  // Load recent activity so the panel isn't empty on first open
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const readIds = getReadIds();
      const [orders, reservations, reviews] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, customer_name, total, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("reservations")
          .select("id, name, guests, date, time, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("reviews")
          .select("id, rating, comment, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const initial: RealtimeNotification[] = [
        ...(orders.data ?? []).map((o: any) => ({
          id: o.id,
          type: "order" as const,
          title: `طلب #${o.order_number}`,
          message: `${o.customer_name ?? "عميل"} — ${Number(o.total).toFixed(0)} ر.س`,
          time: new Date(o.created_at),
          read: readIds.includes(o.id),
        })),
        ...(reservations.data ?? []).map((r: any) => ({
          id: r.id,
          type: "reservation" as const,
          title: `حجز طاولة — ${r.name}`,
          message: `${r.guests} أشخاص — ${r.date} ${r.time}`,
          time: new Date(r.created_at),
          read: readIds.includes(r.id),
        })),
        ...(reviews.data ?? []).map((r: any) => ({
          id: r.id,
          type: "review" as const,
          title: `تقييم جديد (${r.rating}/5)`,
          message: r.comment || "بدون تعليق",
          time: new Date(r.created_at),
          read: readIds.includes(r.id),
        })),
      ].sort((a, b) => b.time.getTime() - a.time.getTime());

      if (!cancelled) {
        setNotifications((prev) => {
          const existing = new Set(prev.map((n) => n.id));
          return [...prev, ...initial.filter((n) => !existing.has(n.id))]
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 20);
        });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    persistReadIds([id, ...getReadIds()]);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    persistReadIds([...notifications.map((n) => n.id), ...getReadIds()]);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };


  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-primary" />;
      case "reservation":
        return <Calendar className="w-4 h-4 text-green-500" />;
      case "review":
        return <MessageSquare className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={markAllAsRead}
            >
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد إشعارات بعد — ستظهر هنا فوراً عند وصول طلب جديد
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => {
                  markAsRead(notification.id);
                  setIsOpen(false);
                  if (notification.type === 'order') navigate('/admin/orders');
                  else if (notification.type === 'reservation') navigate('/admin/reservations');
                  else if (notification.type === 'review') navigate('/admin/reviews');
                }}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getTimeAgo(notification.time)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: "order" | "reservation" | "review";
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "طلب جديد #1234",
    message: "طلب جديد بقيمة 150 ر.س",
    time: new Date(Date.now() - 2 * 60000),
    read: false,
  },
  {
    id: "2",
    type: "reservation",
    title: "حجز جديد",
    message: "حجز لـ 4 أشخاص الساعة 8:00 مساءً",
    time: new Date(Date.now() - 15 * 60000),
    read: false,
  },
  {
    id: "3",
    type: "review",
    title: "تقييم جديد",
    message: "تقييم 5 نجوم من أحمد",
    time: new Date(Date.now() - 30 * 60000),
    read: true,
  },
];

export const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: "order" as const,
          title: `طلب جديد #${Math.floor(Math.random() * 9000) + 1000}`,
          message: `طلب جديد بقيمة ${Math.floor(Math.random() * 200) + 50} ر.س`,
        },
        {
          type: "reservation" as const,
          title: "حجز جديد",
          message: `حجز لـ ${Math.floor(Math.random() * 8) + 2} أشخاص`,
        },
      ];

      const shouldNotify = Math.random() > 0.7;
      if (shouldNotify) {
        const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotif,
          time: new Date(),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);

        toast({
          title: randomNotif.title,
          description: randomNotif.message,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: Notification["type"]) => {
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
              لا توجد إشعارات
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => markAsRead(notification.id)}
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

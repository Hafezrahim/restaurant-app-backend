import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface RealtimeNotification {
  id: string;
  type: "order" | "reservation" | "review";
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

type OnNotification = (n: RealtimeNotification) => void;

const playNotificationSound = () => {
  try {
    const audio = new Audio("/notification-sound.wav");
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}
};

export const useRealtimeAdmin = (onNotification: OnNotification) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const cbRef = useRef(onNotification);
  cbRef.current = onNotification;

  useEffect(() => {
    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as any;
          const notif: RealtimeNotification = {
            id: order.id,
            type: "order",
            title: `طلب جديد #${order.order_number}`,
            message: `طلب جديد من ${order.customer_name} بقيمة ${Number(order.total).toFixed(0)} ر.س`,
            time: new Date(order.created_at),
            read: false,
          };
          cbRef.current(notif);
          playNotificationSound();
          toast({ title: notif.title, description: notif.message });
          qc.invalidateQueries({ queryKey: ["admin-orders"] });
          qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          const res = payload.new as any;
          const notif: RealtimeNotification = {
            id: res.id,
            type: "reservation",
            title: "حجز جديد",
            message: `حجز لـ ${res.guests} أشخاص - ${res.name}`,
            time: new Date(res.created_at),
            read: false,
          };
          cbRef.current(notif);
          toast({ title: notif.title, description: notif.message });
          qc.invalidateQueries({ queryKey: ["admin-reservations"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews" },
        (payload) => {
          const rev = payload.new as any;
          const notif: RealtimeNotification = {
            id: rev.id,
            type: "review",
            title: "تقييم جديد",
            message: `تقييم ${rev.rating} نجوم من ${rev.reviewer_name}`,
            time: new Date(rev.created_at),
            read: false,
          };
          cbRef.current(notif);
          toast({ title: notif.title, description: notif.message });
          qc.invalidateQueries({ queryKey: ["admin-reviews"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        () => {
          qc.invalidateQueries({ queryKey: ["admin-orders"] });
          qc.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, toast]);
};

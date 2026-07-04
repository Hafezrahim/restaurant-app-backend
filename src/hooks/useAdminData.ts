import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ==================== ORDERS ====================
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status: status as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });
};

// ==================== CUSTOMERS (profiles) ====================
export const useAdminCustomers = () => {
  return useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get order stats per user
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total, created_at');

      const ordersByUser: Record<string, { count: number; total: number; lastOrder: string }> = {};
      (orders || []).forEach((o) => {
        if (!o.user_id) return;
        if (!ordersByUser[o.user_id]) {
          ordersByUser[o.user_id] = { count: 0, total: 0, lastOrder: o.created_at };
        }
        ordersByUser[o.user_id].count++;
        ordersByUser[o.user_id].total += Number(o.total);
        if (o.created_at > ordersByUser[o.user_id].lastOrder) {
          ordersByUser[o.user_id].lastOrder = o.created_at;
        }
      });

      return (profiles || []).map((p) => ({
        ...p,
        totalOrders: ordersByUser[p.id]?.count || 0,
        totalSpent: ordersByUser[p.id]?.total || 0,
        lastOrder: ordersByUser[p.id]?.lastOrder || null,
      }));
    },
    staleTime: 60_000,
  });
};

// ==================== RESERVATIONS ====================
export const useAdminReservations = () => {
  return useQuery({
    queryKey: ['admin-reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
};


export const useUpdateReservationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('reservations').update({ status: status as any }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reservations'] }),
  });
};

// ==================== REVIEWS ====================
export const useAdminReviews = () => {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, menu_items(name, name_ar)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
};

export const useUpdateReviewApproval = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_approved }: { id: string; is_approved: boolean }) => {
      const { error } = await supabase.from('reviews').update({ is_approved }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-reviews'] }),
  });
};

// ==================== COUPONS ====================
export const useAdminCoupons = () => {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
};

export const useUpsertCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (coupon: any) => {
      const { error } = await supabase.from('coupons').upsert(coupon);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });
};

// ==================== MENU ITEMS (Admin - all items) ====================
export const useAdminMenuItems = () => {
  return useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, categories(id, name, name_ar, slug, icon, color)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
};

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });
};

export const useUpsertMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from('menu_items').upsert(item);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-menu-items'] }),
  });
};

export const useDeleteMenuItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-menu-items'] }),
  });
};

export const useUpsertCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: any) => {
      const { error } = await supabase.from('categories').upsert(cat);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-categories'] }),
  });
};

// ==================== DASHBOARD STATS ====================
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();

      // Today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', todayISO);

      // Yesterday's orders
      const { data: yesterdayOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', yesterdayISO)
        .lt('created_at', todayISO);

      // Total customers
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Recent 7 days orders for chart
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: weekOrders } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at');

      // Recent orders (last 5)
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Popular items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('name, menu_item_id, quantity, price');

      const todaySales = (todayOrders || []).reduce((s, o) => s + Number(o.total), 0);
      const yesterdaySales = (yesterdayOrders || []).reduce((s, o) => s + Number(o.total), 0);
      const todayCount = todayOrders?.length || 0;
      const yesterdayCount = yesterdayOrders?.length || 0;

      // Aggregate popular items
      const itemAgg: Record<string, { name: string; orders: number; revenue: number }> = {};
      (orderItems || []).forEach((oi) => {
        const key = oi.menu_item_id || oi.name;
        if (!itemAgg[key]) itemAgg[key] = { name: oi.name, orders: 0, revenue: 0 };
        itemAgg[key].orders += oi.quantity;
        itemAgg[key].revenue += Number(oi.price) * oi.quantity;
      });
      const popularItems = Object.values(itemAgg)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      // Weekly chart data
      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const weeklyData: Record<string, { day: string; sales: number; orders: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        weeklyData[key] = { day: dayNames[d.getDay()], sales: 0, orders: 0 };
      }
      (weekOrders || []).forEach((o) => {
        const key = o.created_at.split('T')[0];
        if (weeklyData[key]) {
          weeklyData[key].sales += Number(o.total);
          weeklyData[key].orders++;
        }
      });

      return {
        todayOrders: todayCount,
        todaySales,
        yesterdayOrders: yesterdayCount,
        yesterdaySales,
        totalCustomers: totalCustomers || 0,
        recentOrders: recentOrders || [],
        popularItems,
        weeklyChart: Object.values(weeklyData),
        ordersChange: yesterdayCount ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : 0,
        salesChange: yesterdaySales ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0,
      };
    },
    staleTime: 60_000,
  });
};

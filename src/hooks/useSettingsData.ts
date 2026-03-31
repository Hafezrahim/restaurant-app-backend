import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ==================== RESTAURANT SETTINGS ====================
export const useRestaurantSettings = () => {
  return useQuery({
    queryKey: ['restaurant-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*');
      if (error) throw error;
      
      const settingsMap: Record<string, any> = {};
      (data || []).forEach((row) => {
        settingsMap[row.key] = row.value;
      });
      return settingsMap;
    },
    staleTime: 30_000,
  });
};

export const useSaveSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));
      
      // Upsert each setting by key
      for (const row of rows) {
        const { error } = await supabase
          .from('restaurant_settings')
          .upsert(row, { onConflict: 'key' });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restaurant-settings'] }),
  });
};

// ==================== DELIVERY ZONES (from DB) ====================
export const useDeliveryZones = () => {
  return useQuery({
    queryKey: ['delivery-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });
};

export const useUpsertDeliveryZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (zone: any) => {
      const { error } = await supabase.from('delivery_zones').upsert(zone);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });
};

export const useDeleteDeliveryZone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('delivery_zones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['delivery-zones'] }),
  });
};

// ==================== USERS WITH ROLES ====================
export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rolesError) throw rolesError;

      const userIds = [...new Set((roles || []).map((r) => r.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', userIds);
      if (profilesError) throw profilesError;

      const rolesByUser: Record<string, string[]> = {};
      (roles || []).forEach((r) => {
        if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
        rolesByUser[r.user_id].push(r.role);
      });

      return (profiles || []).map((p) => ({
        ...p,
        roles: rolesByUser[p.id] || ['user'],
      }));
    },
    staleTime: 60_000,
  });
};

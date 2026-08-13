import { supabase } from '@/integrations/supabase/client';

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
}

// Default fallback used only when the DB is unreachable.
export const defaultDeliveryZones: DeliveryZone[] = [
  { id: '1', name: 'داخل المدينة', price: 10, estimatedTime: '20-30' },
  { id: '2', name: 'ضواحي المدينة', price: 20, estimatedTime: '30-45' },
  { id: '3', name: 'خارج المدينة', price: 35, estimatedTime: '45-60' },
];

/**
 * Fetch delivery zones from the database (single source of truth).
 * Fees are NEVER read from localStorage — clients cannot tamper with totals
 * because create-order also re-reads the chosen zone's price server-side.
 */
export const fetchDeliveryZones = async (): Promise<DeliveryZone[]> => {
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('id, name, price, estimated_time, is_active, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) return defaultDeliveryZones;

  return data.map((z) => ({
    id: z.id,
    name: z.name,
    price: Number(z.price),
    estimatedTime: z.estimated_time ?? '',
  }));
};

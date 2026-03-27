export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
}

// Default delivery zones
export const defaultDeliveryZones: DeliveryZone[] = [
  { id: '1', name: 'داخل المدينة', price: 10, estimatedTime: '20-30' },
  { id: '2', name: 'ضواحي المدينة', price: 20, estimatedTime: '30-45' },
  { id: '3', name: 'خارج المدينة', price: 35, estimatedTime: '45-60' },
];

const STORAGE_KEY = 'mazaj_delivery_zones';

export const getDeliveryZones = (): DeliveryZone[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultDeliveryZones;
};

export const saveDeliveryZones = (zones: DeliveryZone[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones));
};

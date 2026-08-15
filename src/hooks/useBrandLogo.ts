import { useRestaurantSettings } from '@/hooks/useSettingsData';
import defaultLogo from '@/assets/logo.png';

/** Restaurant logo + name from admin settings, with static fallbacks. */
export const useBrandLogo = () => {
  const { data: settings } = useRestaurantSettings();
  const general = (settings?.general as any) || {};
  return {
    logoUrl: (general.logo as string) || defaultLogo,
    name: (general.name as string) || 'مزاج',
  };
};

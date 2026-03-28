import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, CategoryInfo, Category } from '@/types';
import { categories as fallbackCategories, menuItems as fallbackMenuItems } from '@/data/menuData';

const mapCategory = (cat: {
  slug: string;
  name: string;
  name_ar: string;
  icon: string;
  color: string;
  image: string | null;
}): CategoryInfo => ({
  id: cat.slug as Category,
  name: cat.name,
  nameAr: cat.name_ar,
  icon: cat.icon,
  color: cat.color,
  image: cat.image ?? undefined,
});

const mapMenuItem = (item: {
  id: string;
  name: string;
  name_ar: string | null;
  description: string;
  price: number | string;
  image: string | null;
  rating: number | string;
  is_popular: boolean;
  is_new: boolean;
  ingredients: string[] | null;
  categories?: { slug: string } | { slug: string }[] | null;
}): MenuItem => ({
  id: item.id,
  name: item.name,
  nameAr: item.name_ar ?? undefined,
  description: item.description,
  price: Number(item.price),
  image: item.image ?? '',
  category: (Array.isArray(item.categories)
    ? item.categories[0]?.slug
    : item.categories?.slug ?? 'arabic') as Category,
  rating: Number(item.rating),
  isPopular: item.is_popular,
  isNew: item.is_new,
  ingredients: item.ingredients ?? undefined,
});

// Fetch categories from Supabase and fall back to local seed data if needed
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryInfo[]> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order')
          .abortSignal(controller.signal);

        clearTimeout(timeout);

        if (error || !data?.length) {
          return fallbackCategories;
        }

        return data.map(mapCategory);
      } catch (e) {
        console.warn('[useCategories] falling back to local data:', e);
        return fallbackCategories;
      }
    },
    placeholderData: fallbackCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Fetch menu items from Supabase and fall back to local seed data if needed
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menuItems'],
    queryFn: async (): Promise<MenuItem[]> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const { data, error } = await supabase
          .from('menu_items')
          .select('*, categories!menu_items_category_id_fkey(slug)')
          .eq('is_available', true)
          .order('created_at')
          .abortSignal(controller.signal);

        clearTimeout(timeout);

        if (error || !data?.length) {
          return fallbackMenuItems;
        }

        return data.map((item) => mapMenuItem(item as never));
      } catch (e) {
        console.warn('[useMenuItems] falling back to local data:', e);
        return fallbackMenuItems;
      }
    },
    placeholderData: fallbackMenuItems,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Get a single menu item by ID
export const useMenuItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ['menuItem', id],
    queryFn: async (): Promise<MenuItem | null> => {
      if (!id) return null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const { data, error } = await supabase
          .from('menu_items')
          .select('*, categories!menu_items_category_id_fkey(slug)')
          .eq('id', id)
          .single()
          .abortSignal(controller.signal);

        clearTimeout(timeout);

        if (error || !data) {
          return fallbackMenuItems.find((item) => item.id === id) ?? null;
        }

        return mapMenuItem(data as never);
      } catch (e) {
        console.warn('[useMenuItem] falling back to local data:', e);
        return fallbackMenuItems.find((item) => item.id === id) ?? null;
      }
    },
    enabled: !!id,
    placeholderData: () => fallbackMenuItems.find((item) => item.id === id) ?? null,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

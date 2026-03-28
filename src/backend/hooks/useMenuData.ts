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
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order');

        console.log('[useCategories] data:', data?.length, 'error:', error?.message);

        if (error || !data?.length) {
          console.log('[useCategories] using fallback');
          return fallbackCategories;
        }

        return data.map(mapCategory);
      } catch (e) {
        console.error('[useCategories] exception:', e);
        return fallbackCategories;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch menu items from Supabase and fall back to local seed data if needed
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menuItems'],
    queryFn: async (): Promise<MenuItem[]> => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*, categories!menu_items_category_id_fkey(slug)')
          .eq('is_available', true)
          .order('created_at');

        console.log('[useMenuItems] data:', data?.length, 'error:', error?.message);

        if (error || !data?.length) {
          console.log('[useMenuItems] using fallback, items:', fallbackMenuItems.length);
          return fallbackMenuItems;
        }

        return data.map((item) => mapMenuItem(item as never));
      } catch (e) {
        console.error('[useMenuItems] exception:', e);
        return fallbackMenuItems;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get a single menu item by ID
export const useMenuItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ['menuItem', id],
    queryFn: async (): Promise<MenuItem | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('menu_items')
        .select('*, categories!menu_items_category_id_fkey(slug)')
        .eq('id', id)
        .single();

      if (error || !data) {
        return fallbackMenuItems.find((item) => item.id === id) ?? null;
      }

      return mapMenuItem(data as never);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

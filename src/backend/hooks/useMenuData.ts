import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, CategoryInfo, Category } from '@/types';

// Fetch categories from Supabase and map to app types
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryInfo[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      return (data ?? []).map((cat) => ({
        id: cat.slug as Category,
        name: cat.name,
        nameAr: cat.name_ar,
        icon: cat.icon,
        color: cat.color,
        image: cat.image ?? undefined,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch menu items from Supabase and map to app types
export const useMenuItems = () => {
  return useQuery({
    queryKey: ['menuItems'],
    queryFn: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, categories!menu_items_category_id_fkey(slug)')
        .eq('is_available', true)
        .order('created_at');

      if (error) throw error;

      return (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        nameAr: item.name_ar ?? undefined,
        description: item.description,
        price: Number(item.price),
        image: item.image ?? '',
        category: ((item.categories as any)?.slug ?? 'arabic') as Category,
        rating: Number(item.rating),
        isPopular: item.is_popular,
        isNew: item.is_new,
        ingredients: item.ingredients ?? undefined,
      }));
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

      if (error) return null;

      return {
        id: data.id,
        name: data.name,
        nameAr: data.name_ar ?? undefined,
        description: data.description,
        price: Number(data.price),
        image: data.image ?? '',
        category: ((data.categories as any)?.slug ?? 'arabic') as Category,
        rating: Number(data.rating),
        isPopular: data.is_popular,
        isNew: data.is_new,
        ingredients: data.ingredients ?? undefined,
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

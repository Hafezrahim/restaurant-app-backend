import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { MenuItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface FavoritesContextType {
  favorites: MenuItem[];
  toggleFavorite: (item: MenuItem) => void;
  isFavorite: (itemId: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'favorites_v1';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const readLocal = (): MenuItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (items: MenuItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode — ignore */
  }
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<MenuItem[]>(() => readLocal());
  const [isLoading, setIsLoading] = useState(false);
  const userIdRef = useRef<string | null>(null);

  // Persist locally on every change (works for guests and as an offline cache)
  useEffect(() => {
    writeLocal(favorites);
  }, [favorites]);

  // Sync with Supabase when a user session exists
  useEffect(() => {
    let active = true;

    const hydrate = async (userId: string) => {
      setIsLoading(true);
      try {
        const local = readLocal();

        // Push any guest favorites into the user's account
        const localSyncable = local.filter((f) => UUID_RE.test(f.id));
        if (localSyncable.length) {
          await supabase
            .from('favorites')
            .upsert(
              localSyncable.map((f) => ({ user_id: userId, menu_item_id: f.id })),
              { onConflict: 'user_id,menu_item_id', ignoreDuplicates: true }
            );
        }

        const { data, error } = await supabase
          .from('favorites')
          .select('menu_item_id, menu_items!favorites_menu_item_id_fkey(*, categories!menu_items_category_id_fkey(slug))')
          .eq('user_id', userId);

        if (error || !active) return;

        const remote: MenuItem[] = (data ?? [])
          .map((row: any) => row.menu_items)
          .filter(Boolean)
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            nameAr: item.name_ar ?? undefined,
            description: item.description,
            price: Number(item.price),
            image: item.image ?? '',
            category: (Array.isArray(item.categories)
              ? item.categories[0]?.slug
              : item.categories?.slug ?? 'arabic') as MenuItem['category'],
            rating: Number(item.rating),
            isPopular: item.is_popular,
            isNew: item.is_new,
            ingredients: item.ingredients ?? undefined,
          }));

        // Keep non-syncable (local seed) favorites around
        const localOnly = local.filter((f) => !UUID_RE.test(f.id));
        setFavorites([...remote, ...localOnly]);
      } catch (e) {
        console.warn('[Favorites] sync failed, using local data:', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) hydrate(uid);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        setTimeout(() => hydrate(uid), 0);
      }
      if (event === 'SIGNED_OUT') {
        setFavorites([]);
        writeLocal([]);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const toggleFavorite = useCallback((item: MenuItem) => {
    let removing = false;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      removing = exists;
      return exists ? prev.filter((f) => f.id !== item.id) : [...prev, item];
    });

    const userId = userIdRef.current;
    if (!userId || !UUID_RE.test(item.id)) return;

    void (async () => {
      try {
        if (removing) {
          await supabase.from('favorites').delete().eq('user_id', userId).eq('menu_item_id', item.id);
        } else {
          await supabase
            .from('favorites')
            .upsert({ user_id: userId, menu_item_id: item.id }, { onConflict: 'user_id,menu_item_id', ignoreDuplicates: true });
        }
      } catch (e) {
        console.warn('[Favorites] persist failed:', e);
      }
    })();
  }, []);

  const isFavorite = useCallback(
    (itemId: string) => favorites.some((f) => f.id === itemId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

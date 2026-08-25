import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

/**
 * Ids of properties the visitor has favorited. A global Zustand store so the
 * navbar badge, the mobile nav badge, and every property card stay in sync
 * the instant one of them toggles a favorite, with no prop drilling.
 */
export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((favId) => favId !== id)
            : [...state.favorites, id],
        })),
    }),
    { name: 'onina_favorites' }
  )
);

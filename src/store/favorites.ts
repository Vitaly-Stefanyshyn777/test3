import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteItem {
  id: string;
  slug?: string;
  name: string;
  price?: number;
  image?: string;
  originalPrice?: number;
  discount?: number;
  isNew?: boolean;
  isHit?: boolean;
}

interface FavoriteState {
  items: Record<string, FavoriteItem>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleFavorite: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set) => ({
      items: {},
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      toggleFavorite: (item) =>
        set((state) => {
          const exists = !!state.items[item.id];
          const next = { ...state.items };
          if (exists) delete next[item.id];
          else next[item.id] = item;
          return { items: next };
        }),
      remove: (id) =>
        set((state) => {
          const next = { ...state.items };
          delete next[id];
          return { items: next };
        }),
      clear: () => set({ items: {} }),
    }),
    { name: "bfb-favorites", partialize: (s) => ({ items: s.items }) }
  )
);

export const selectFavorites = (s: FavoriteState) => Object.values(s.items);
export const selectIsFavorite = (id: string) => (s: FavoriteState) =>
  !!s.items[id];

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  clearWishlist as clearWishlistApi,
  checkWishlistItem,
  type WishlistItemResponse,
} from "@/lib/bfbApi";
import { useAuthStore } from "./auth";

const getUserFavoritesKey = (userId?: string | null) =>
  userId ? `bfb-favorites-${userId}` : "bfb-favorites";

const loadUserFavorites = (userId?: string | null): Record<string, FavoriteItem> => {
  if (!userId || typeof window === "undefined") return {};
  try {
    const key = getUserFavoritesKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).items || {} : {};
  } catch {
    return {};
  }
};

const saveUserFavorites = (
  userId: string | null | undefined,
  items: Record<string, FavoriteItem>
) => {
  if (!userId || typeof window === "undefined") return;
  try {
    const key = getUserFavoritesKey(userId);
    localStorage.setItem(key, JSON.stringify({ items }));
  } catch {}
};

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
  wcProduct?: {
    prices?: {
      price: string;
      regular_price: string;
      sale_price: string;
    };
    on_sale?: boolean;
  };
}

const mapWishlistItemResponseToFavoriteItem = (
  item: WishlistItemResponse,
  existingItem?: FavoriteItem
): FavoriteItem => ({
  id: item.product_id.toString(),
  name: item.product_name,
  price: parseFloat(item.product_price),
  image: item.product_image,
  slug: existingItem?.slug,
  originalPrice: existingItem?.originalPrice,
  discount: existingItem?.discount,
  isNew: existingItem?.isNew,
  isHit: existingItem?.isHit,
  wcProduct: existingItem?.wcProduct,
});

function extractProductId(id: string): number | null {
  if (/^\d+$/.test(id)) {
    return parseInt(id, 10);
  }
  const match = id.match(/(?:course|product)-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  const numberMatch = id.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }
  return null;
}

interface FavoriteState {
  items: Record<string, FavoriteItem>;
  currentUserId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  loadUserData: (userId: string | null) => Promise<void>;
  setUserId: (userId: string | null) => void;
  syncFromApi: () => Promise<void>;
  checkIsFavorite: (productId: number) => Promise<boolean>;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: {},
      currentUserId: null,
      isOpen: false,
      isLoading: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setUserId: (userId: string | null) => {
        const state = get();
        if (state.currentUserId && state.currentUserId !== userId) {
          saveUserFavorites(state.currentUserId, state.items);
        }
        set({ currentUserId: userId });
      },
      loadUserData: async (userId: string | null) => {
        const state = get();
        if (state.currentUserId && state.currentUserId !== userId) {
          saveUserFavorites(state.currentUserId, state.items);
        }

        const { token } = useAuthStore.getState();
        const hasTokenInStore = !!token;
        const hasTokenInStorage =
          typeof window !== "undefined" &&
          (!!localStorage.getItem("bfb_token") || !!localStorage.getItem("bfb_token_old"));

        if (userId && hasTokenInStore && hasTokenInStorage) {
          try {
            set({ isLoading: true });
            await new Promise((resolve) => setTimeout(resolve, 100));

            const wishlistData = await getWishlist();
            const currentItems = state.items;
            const itemsMap: Record<string, FavoriteItem> = {};
            wishlistData.items.forEach((item) => {
              const existing = currentItems[item.product_id.toString()];
              const favoriteItem = mapWishlistItemResponseToFavoriteItem(item, existing);
              itemsMap[favoriteItem.id] = favoriteItem;
            });
            set({
              items: itemsMap,
              currentUserId: userId,
              isLoading: false,
            });
          } catch (error: any) {
            const is401 = error?.response?.status === 401 || error?.message?.includes("401");
            const userItems = loadUserFavorites(userId);
            set({ items: userItems, currentUserId: userId, isLoading: false });
          }
        } else {
          const userItems = userId ? loadUserFavorites(userId) : {};
          set({ items: userItems, currentUserId: userId });
        }
      },
      syncFromApi: async () => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) return;

        try {
          const wishlistData = await getWishlist();
          const currentItems = get().items;
          const itemsMap: Record<string, FavoriteItem> = {};
          wishlistData.items.forEach((item) => {
            const existing = currentItems[item.product_id.toString()];
            const favoriteItem = mapWishlistItemResponseToFavoriteItem(item, existing);
            itemsMap[favoriteItem.id] = favoriteItem;
          });
          set({ items: itemsMap });
        } catch (error) {
          // Fallback to local state on error
        }
      },
      checkIsFavorite: async (productId: number): Promise<boolean> => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) {
          const state = get();
          return !!state.items[productId.toString()];
        }

        try {
          const result = await checkWishlistItem(productId);
          return result.in_wishlist;
        } catch (error) {
          const state = get();
          return !!state.items[productId.toString()];
        }
      },
      toggleFavorite: async (item: FavoriteItem) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const productId = extractProductId(item.id);
        const exists = !!state.items[item.id];

        if (productId === null) {
          return;
        }

        const next = { ...state.items };
        if (exists) {
          delete next[item.id];
        } else {
          next[item.id] = item;
        }

        if (state.currentUserId && token) {
          try {
            set({ isLoading: true });
            if (exists) {
              await removeFromWishlistApi(productId);
            } else {
              await addToWishlistApi(productId);
            }
            set({ items: next, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserFavorites(state.currentUserId, next);
            }
            set({ items: next, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, next);
          }
          set({ items: next });
        }
      },
      remove: async (id: string) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const productId = extractProductId(id);

        if (productId === null) {
          return;
        }

        const next = { ...state.items };
        delete next[id];

        if (state.currentUserId && token) {
          try {
            set({ isLoading: true });
            await removeFromWishlistApi(productId);
            set({ items: next, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserFavorites(state.currentUserId, next);
            }
            set({ items: next, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, next);
          }
          set({ items: next });
        }
      },
      clear: async () => {
        const state = get();
        const { token } = useAuthStore.getState();

        if (state.currentUserId && token) {
          try {
            set({ isLoading: true });
            await clearWishlistApi();
            set({ items: {}, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserFavorites(state.currentUserId, {});
            }
            set({ items: {}, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, {});
          }
          set({ items: {} });
        }
      },
    }),
    {
      name: "bfb-favorites",
      partialize: (s) => ({
        items: s.items,
        currentUserId: s.currentUserId,
      }),
    }
  )
);

export const selectFavorites = (s: FavoriteState) => Object.values(s.items);
export const selectIsFavorite = (id: string) => (s: FavoriteState) => !!s.items[id];

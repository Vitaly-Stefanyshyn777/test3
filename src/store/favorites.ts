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

const loadUserFavorites = (
  userId?: string | null
): Record<string, FavoriteItem> => {
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
  regularPrice?: number;
  salePrice?: number;
  discount?: number;
  isNew?: boolean;
  isHit?: boolean;
  variationId?: number;
  color?: string;
  size?: string;
  stockQuantity?: number | null;
  productType?: string;
  variations?: number[];
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
  variationId: existingItem?.variationId,
  color: existingItem?.color,
  size: existingItem?.size,
  stockQuantity: existingItem?.stockQuantity,
  productType: existingItem?.productType,
  variations: existingItem?.variations,
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

function countItemsByProductId(
  items: Record<string, FavoriteItem>,
  productId: number
): number {
  return Object.keys(items).filter((key) => extractProductId(key) === productId)
    .length;
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
  removeAll: (ids: string[]) => Promise<void>;
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
        // При логауті (userId === null) не зберігаємо дані, а очищуємо
        if (state.currentUserId && state.currentUserId !== userId && userId !== null) {
          saveUserFavorites(state.currentUserId, state.items);
        }

        const { token } = useAuthStore.getState();
        const hasTokenInStore = !!token;
        const hasTokenInStorage =
          typeof window !== "undefined" &&
          (!!localStorage.getItem("bfb_token") ||
            !!localStorage.getItem("bfb_token_old"));

        if (userId && hasTokenInStore && hasTokenInStorage) {
          try {
            set({ isLoading: true });
            await new Promise((resolve) => setTimeout(resolve, 100));

            const wishlistData = await getWishlist();
            const currentItems = state.items;
            const itemsMap: Record<string, FavoriteItem> = { ...currentItems };

            wishlistData.items.forEach((apiItem) => {
              const baseKey = apiItem.product_id.toString();
              const existingBase = currentItems[baseKey];
              const base = mapWishlistItemResponseToFavoriteItem(
                apiItem,
                existingBase
              );

              // Оновлюємо базовий елемент або створюємо його, якщо взагалі нічого немає по цьому продукту
              const hasAnyForProduct =
                Object.keys(itemsMap).some(
                  (k) => extractProductId(k) === apiItem.product_id
                );
              if (!hasAnyForProduct) {
                itemsMap[base.id] = base;
              } else if (itemsMap[baseKey] && !itemsMap[baseKey].variationId) {
                itemsMap[baseKey] = { ...itemsMap[baseKey], ...base };
              }
            });

            set({
              items: itemsMap,
              currentUserId: userId,
              isLoading: false,
            });
          } catch (error: any) {
            const is401 =
              error?.response?.status === 401 ||
              error?.message?.includes("401");
            const userItems = loadUserFavorites(userId);
            set({ items: userItems, currentUserId: userId, isLoading: false });
          }
        } else {
          // При логауті (userId === null) очищуємо улюблені повністю
          if (userId === null) {
            set({ items: {}, currentUserId: null });
            // Очищуємо всі дані з localStorage
            if (typeof window !== "undefined") {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith("bfb-favorites")) {
                  localStorage.removeItem(key);
                }
              });
            }
          } else {
            const userItems = loadUserFavorites(userId);
            set({ items: userItems, currentUserId: userId });
          }
        }
      },
      syncFromApi: async () => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) return;

        try {
          const wishlistData = await getWishlist();
          const currentItems = get().items;
          const itemsMap: Record<string, FavoriteItem> = { ...currentItems };

          wishlistData.items.forEach((apiItem) => {
            const baseKey = apiItem.product_id.toString();
            const existingBase = currentItems[baseKey];
            const base = mapWishlistItemResponseToFavoriteItem(
              apiItem,
              existingBase
            );

            const hasAnyForProduct = Object.keys(itemsMap).some(
              (k) => extractProductId(k) === apiItem.product_id
            );
            if (!hasAnyForProduct) {
              itemsMap[base.id] = base;
            } else if (itemsMap[baseKey] && !itemsMap[baseKey].variationId) {
              itemsMap[baseKey] = { ...itemsMap[baseKey], ...base };
            }
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

        if (productId === null) {
          return;
        }

        // Для варіацій зберігаємо унікальні елементи (не затираємо інші варіації цього ж товару)
        const existing = state.items[item.id];
        const beforeCount = countItemsByProductId(state.items, productId);

        const exists = !!existing;

        const next = { ...state.items };
        if (exists) {
          // Видаляємо існуючий товар (за знайденим ключем)
          delete next[item.id];
        } else {
          // Додаємо новий товар
          next[item.id] = item;
        }

        // Негайне оновлення UI стану для кращого UX
        set({ items: next });

        if (state.currentUserId && token) {
          // Виконуємо API запит асинхронно, без блокування UI
          (async () => {
            try {
              set({ isLoading: true });
              const afterCount = countItemsByProductId(next, productId);

              // Бекенд wishlist зберігає тільки product_id:
              // - при додаванні першої варіації/товару -> додаємо product_id
              // - при видаленні останньої варіації/товару -> видаляємо product_id
              if (!exists && beforeCount === 0 && afterCount > 0) {
                await addToWishlistApi(productId);
              } else if (exists && afterCount === 0) {
                await removeFromWishlistApi(productId);
              }
              // Не оновлюємо стан після API, бо він вже оновлений негайно
              set({ isLoading: false });
            } catch (error) {
              // При помилці залишаємо стан оновленим (кращий UX - не повертаємо назад)
              // Можливо, можна показати повідомлення про помилку синхронізації
              set({ isLoading: false });
            }
          })();
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, next);
          }
          // Стан вже оновлений вище
        }
      },
      remove: async (id: string) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const productId = extractProductId(id);

        if (productId === null) {
          return;
        }

        // Негайне оновлення UI стану для кращого UX
        const next = { ...state.items };
        delete next[id];
        set({ items: next });

        if (state.currentUserId && token) {
          // API запит в бекграунді
          (async () => {
            try {
              set({ isLoading: true });
              await removeFromWishlistApi(productId);
              set({ isLoading: false });
            } catch (error) {
              // При помилці стан залишається оновленим (кращий UX)
              set({ isLoading: false });
              if (state.currentUserId) {
                saveUserFavorites(state.currentUserId, get().items);
              }
            }
          })();
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, next);
          }
          // Стан вже оновлений вище
        }
      },
      removeAll: async (ids: string[]) => {
        const state = get();
        const { token } = useAuthStore.getState();

        // Негайне оновлення UI стану для кращого UX
        const next = { ...state.items };
        ids.forEach((id) => delete next[id]);
        set({ items: next });

        if (state.currentUserId && token) {
          // Послідовні API запити для надійності
          for (const id of ids) {
            const productId = extractProductId(id);
            if (productId !== null) {
              try {
                await removeFromWishlistApi(productId);
              } catch (error) {
                // Ігноруємо помилки (товар вже видалений або інші проблеми)
                console.warn('Failed to remove item from wishlist:', productId, error);
              }
            }
          }
          set({ isLoading: false });
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, next);
          }
          // Стан вже оновлений вище
        }
      },
      clear: async () => {
        const state = get();
        const { token } = useAuthStore.getState();

        // Негайне оновлення UI стану для кращого UX
        set({ items: {} });

        if (state.currentUserId && token) {
          // API запит в бекграунді
          (async () => {
            try {
              set({ isLoading: true });
              await clearWishlistApi();
              set({ isLoading: false });
            } catch (error) {
              // При помилці стан залишається оновленим
              set({ isLoading: false });
              if (state.currentUserId) {
                saveUserFavorites(state.currentUserId, {});
              }
            }
          })();
        } else {
          if (state.currentUserId) {
            saveUserFavorites(state.currentUserId, {});
          }
          // Стан вже оновлений вище
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
export const selectIsFavorite = (id: string) => (s: FavoriteState) =>
  !!s.items[id];

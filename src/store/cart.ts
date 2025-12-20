import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
  clearCart as clearCartApi,
  type CartItemResponse,
} from "@/lib/bfbApi";
import { useAuthStore } from "./auth";
import { normalizeImageUrl } from "@/lib/imageUtils";

const getUserCartKey = (userId?: string | null) =>
  userId ? `bfb-cart-${userId}` : "bfb-cart";

const loadUserCart = (userId?: string | null): Record<string, CartItem> => {
  if (!userId || typeof window === "undefined") return {};
  try {
    const key = getUserCartKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return parsed.items || parsed.state?.items || {};
  } catch {
    return {};
  }
};

const saveUserCart = (
  userId: string | null | undefined,
  items: Record<string, CartItem>
) => {
  if (!userId || typeof window === "undefined") return;
  try {
    const key = getUserCartKey(userId);
    localStorage.setItem(key, JSON.stringify({ items }));
  } catch {}
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  color?: string;
  originalPrice?: number;
  sku?: string;
  cart_item_key?: string;
}

export interface AddItemData {
  id: string;
  name: string;
  price: number;
  image?: string;
  color?: string;
  originalPrice?: number;
  sku?: string;
}

interface CartState {
  items: Record<string, CartItem>;
  currentUserId: string | null;
  isOpen: boolean;
  isLoading: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: AddItemData, qty?: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  increment: (id: string, step?: number) => Promise<void>;
  decrement: (id: string, step?: number) => Promise<void>;
  loadUserData: (userId: string | null) => Promise<void>;
  setUserId: (userId: string | null) => void;
  syncFromApi: () => Promise<void>;
}

const mapCartItemResponseToCartItem = (
  item: CartItemResponse,
  existingItem?: CartItem
): CartItem => {
  let finalImage = "";

  if (item.product_image && item.product_image.trim() !== "") {
    finalImage = item.product_image;
  } else if (
    existingItem?.image &&
    existingItem.image.trim() !== "" &&
    existingItem.image !== "/placeholder.svg"
  ) {
    finalImage = existingItem.image;
  } else {
    finalImage = existingItem?.image || "";
  }

  return {
    id: item.product_id.toString(),
    name: item.product_name,
    price: parseFloat(item.product_price),
    image: finalImage,
    quantity: item.quantity,
    cart_item_key: item.cart_item_key,
    color: existingItem?.color,
    originalPrice: existingItem?.originalPrice,
    sku: existingItem?.sku,
  };
};

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

export const useCartStore = create<CartState>()(
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
          saveUserCart(state.currentUserId, state.items);
        }
        set({ currentUserId: userId });
      },
      loadUserData: async (userId: string | null) => {
        const state = get();
        if (state.currentUserId && state.currentUserId !== userId) {
          saveUserCart(state.currentUserId, state.items);
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
            const cartData = await getCart();
            const currentItems = state.items;
            const itemsMap: Record<string, CartItem> = {};

            const productsMap: Map<number, string> = new Map();
            const productsToFetch = cartData.items.filter(
              (item) => !item.product_image || item.product_image.trim() === ""
            );

            if (productsToFetch.length > 0) {
              try {
                const { getProductById } = await import("@/lib/products");
                await Promise.all(
                  productsToFetch.map(async (item) => {
                    try {
                      const product = await getProductById(
                        item.product_id.toString()
                      );
                      if (
                        product.images &&
                        product.images.length > 0 &&
                        product.images[0].src
                      ) {
                        productsMap.set(item.product_id, product.images[0].src);
                      }
                    } catch {
                      // ignore
                    }
                  })
                );
              } catch {
                // ignore
              }
            }

            cartData.items.forEach((item) => {
              const existing = currentItems[item.product_id.toString()];

              if (
                (!item.product_image || item.product_image.trim() === "") &&
                productsMap.has(item.product_id)
              ) {
                item.product_image = productsMap.get(item.product_id) || "";
              }

              const cartItem = mapCartItemResponseToCartItem(item, existing);
              itemsMap[cartItem.id] = cartItem;
            });
            set({ items: itemsMap, currentUserId: userId, isLoading: false });
          } catch (error) {
            const userItems = loadUserCart(userId);
            set({ items: userItems, currentUserId: userId, isLoading: false });
          }
        } else {
          const userItems = userId ? loadUserCart(userId) : {};
          set({ items: userItems, currentUserId: userId });
        }
      },
      syncFromApi: async () => {
        const { currentUserId } = get();
        const { token } = useAuthStore.getState();
        if (!currentUserId || !token) return;

        try {
          const cartData = await getCart();
          const currentItems = get().items;
          const itemsMap: Record<string, CartItem> = {};

          const productsMap: Map<number, string> = new Map();
          const productsToFetch = cartData.items.filter(
            (item) => !item.product_image || item.product_image.trim() === ""
          );

          if (productsToFetch.length > 0) {
            try {
              const { getProductById } = await import("@/lib/products");
              await Promise.all(
                productsToFetch.map(async (item) => {
                  try {
                    const product = await getProductById(
                      item.product_id.toString()
                    );
                    if (
                      product.images &&
                      product.images.length > 0 &&
                      product.images[0].src
                    ) {
                      productsMap.set(item.product_id, product.images[0].src);
                    }
                  } catch {
                    // ignore
                  }
                })
              );
            } catch {
              // ignore
            }
          }

          cartData.items.forEach((item) => {
            const existing = currentItems[item.product_id.toString()];

            if (
              (!item.product_image || item.product_image.trim() === "") &&
              productsMap.has(item.product_id)
            ) {
              item.product_image = productsMap.get(item.product_id) || "";
            }

            const cartItem = mapCartItemResponseToCartItem(item, existing);
            itemsMap[cartItem.id] = cartItem;
          });
          set({ items: itemsMap });
        } catch (error) {
          // Fallback to local state on error
        }
      },
      addItem: async (item, qty = 1) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const productId = extractProductId(item.id);

        if (productId === null) {
          return;
        }

        const isLoggedIn = !!token && !!state.currentUserId;
        const existing = state.items[item.id];
        const nextQty = (existing?.quantity || 0) + qty;

        // Зберігаємо зображення з item.image, якщо воно є і не є placeholder, інакше використовуємо існуюче
        const finalImage =
          item.image && item.image !== "/placeholder.svg"
            ? item.image
            : existing?.image && existing.image !== "/placeholder.svg"
            ? existing.image
            : "/placeholder.svg";

        const newItem: CartItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          image: finalImage,
          color: item.color,
          originalPrice: item.originalPrice,
          sku: item.sku,
          quantity: nextQty,
        };

        if (isLoggedIn) {
          try {
            set({ isLoading: true });
            const tempItems = { ...state.items, [item.id]: newItem };
            set({ items: tempItems });

            const result = await addToCartApi(productId, nextQty);

            const productsMap: Map<number, string> = new Map();
            const productsToFetch = result.cart.items.filter(
              (cartItem) =>
                !cartItem.product_image || cartItem.product_image.trim() === ""
            );

            if (productsToFetch.length > 0) {
              try {
                const { getProductById } = await import("@/lib/products");
                await Promise.all(
                  productsToFetch.map(async (cartItem) => {
                    try {
                      const product = await getProductById(
                        cartItem.product_id.toString()
                      );
                      if (
                        product.images &&
                        product.images.length > 0 &&
                        product.images[0].src
                      ) {
                        productsMap.set(
                          cartItem.product_id,
                          product.images[0].src
                        );
                      }
                    } catch {
                      // ignore
                    }
                  })
                );
              } catch {
                // ignore
              }
            }

            const itemsMap: Record<string, CartItem> = {};
            result.cart.items.forEach((cartItem) => {
              if (
                (!cartItem.product_image ||
                  cartItem.product_image.trim() === "") &&
                productsMap.has(cartItem.product_id)
              ) {
                cartItem.product_image =
                  productsMap.get(cartItem.product_id) || "";
              }

              const existing =
                cartItem.product_id.toString() === item.id
                  ? newItem
                  : tempItems[cartItem.product_id.toString()];
              const mapped = mapCartItemResponseToCartItem(cartItem, existing);
              itemsMap[mapped.id] = mapped;
            });
            set({ items: itemsMap, isLoading: false });
          } catch (error) {
            const newItems = { ...state.items, [item.id]: newItem };
            saveUserCart(state.currentUserId, newItems);
            set({ items: newItems, isLoading: false });
          }
        } else {
          const newItems = { ...state.items, [item.id]: newItem };
          if (state.currentUserId) {
            saveUserCart(state.currentUserId, newItems);
          }
          set({ items: newItems });
        }
      },
      removeItem: async (id: string) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const item = state.items[id];
        const next = { ...state.items };
        delete next[id];

        if (state.currentUserId && token && item?.cart_item_key) {
          try {
            set({ isLoading: true });
            const result = await removeCartItemApi(item.cart_item_key);
            const currentItems = state.items;
            const itemsMap: Record<string, CartItem> = {};

            const productsMap: Map<number, string> = new Map();
            const productsToFetch = result.cart.items.filter(
              (cartItem) =>
                !cartItem.product_image || cartItem.product_image.trim() === ""
            );

            if (productsToFetch.length > 0) {
              try {
                const { getProductById } = await import("@/lib/products");
                await Promise.all(
                  productsToFetch.map(async (cartItem) => {
                    try {
                      const product = await getProductById(
                        cartItem.product_id.toString()
                      );
                      if (
                        product.images &&
                        product.images.length > 0 &&
                        product.images[0].src
                      ) {
                        productsMap.set(
                          cartItem.product_id,
                          product.images[0].src
                        );
                      }
                    } catch {
                      // ignore
                    }
                  })
                );
              } catch {
                // ignore
              }
            }

            result.cart.items.forEach((cartItem) => {
              if (
                (!cartItem.product_image ||
                  cartItem.product_image.trim() === "") &&
                productsMap.has(cartItem.product_id)
              ) {
                cartItem.product_image =
                  productsMap.get(cartItem.product_id) || "";
              }

              const existing = currentItems[cartItem.product_id.toString()];
              const mapped = mapCartItemResponseToCartItem(cartItem, existing);
              itemsMap[mapped.id] = mapped;
            });
            set({ items: itemsMap, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserCart(state.currentUserId, next);
            }
            set({ items: next, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserCart(state.currentUserId, next);
          }
          set({ items: next });
        }
      },
      increment: async (id: string, step = 1) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const item = state.items[id];
        if (!item) return;

        const newQuantity = item.quantity + step;
        const newItems = {
          ...state.items,
          [id]: { ...item, quantity: newQuantity },
        };

        if (state.currentUserId && token && item.cart_item_key) {
          try {
            set({ isLoading: true });
            const result = await updateCartItemApi(
              item.cart_item_key,
              newQuantity
            );
            const currentItems = state.items;
            const itemsMap: Record<string, CartItem> = {};

            const productsMap: Map<number, string> = new Map();
            const productsToFetch = result.cart.items.filter(
              (cartItem) =>
                !cartItem.product_image || cartItem.product_image.trim() === ""
            );

            if (productsToFetch.length > 0) {
              try {
                const { getProductById } = await import("@/lib/products");
                await Promise.all(
                  productsToFetch.map(async (cartItem) => {
                    try {
                      const product = await getProductById(
                        cartItem.product_id.toString()
                      );
                      if (
                        product.images &&
                        product.images.length > 0 &&
                        product.images[0].src
                      ) {
                        productsMap.set(
                          cartItem.product_id,
                          product.images[0].src
                        );
                      }
                    } catch {
                      // ignore
                    }
                  })
                );
              } catch {
                // ignore
              }
            }

            result.cart.items.forEach((cartItem) => {
              if (
                (!cartItem.product_image ||
                  cartItem.product_image.trim() === "") &&
                productsMap.has(cartItem.product_id)
              ) {
                cartItem.product_image =
                  productsMap.get(cartItem.product_id) || "";
              }

              const existing = currentItems[cartItem.product_id.toString()];
              const mapped = mapCartItemResponseToCartItem(cartItem, existing);
              itemsMap[mapped.id] = mapped;
            });
            set({ items: itemsMap, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserCart(state.currentUserId, newItems);
            }
            set({ items: newItems, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserCart(state.currentUserId, newItems);
          }
          set({ items: newItems });
        }
      },
      decrement: async (id: string, step = 1) => {
        const state = get();
        const { token } = useAuthStore.getState();
        const item = state.items[id];
        if (!item) return;

        const newQty = Math.max(0, item.quantity - step);
        const next = { ...state.items };

        if (newQty <= 0) {
          delete next[id];
        } else {
          next[id] = { ...item, quantity: newQty };
        }

        if (state.currentUserId && token && item.cart_item_key) {
          try {
            set({ isLoading: true });
            let result;
            if (newQty <= 0) {
              result = await removeCartItemApi(item.cart_item_key);
            } else {
              result = await updateCartItemApi(item.cart_item_key, newQty);
            }

            const currentItems = state.items;
            const itemsMap: Record<string, CartItem> = {};

            const productsMap: Map<number, string> = new Map();
            const productsToFetch = result.cart.items.filter(
              (cartItem) =>
                !cartItem.product_image || cartItem.product_image.trim() === ""
            );

            if (productsToFetch.length > 0) {
              try {
                const { getProductById } = await import("@/lib/products");
                await Promise.all(
                  productsToFetch.map(async (cartItem) => {
                    try {
                      const product = await getProductById(
                        cartItem.product_id.toString()
                      );
                      if (
                        product.images &&
                        product.images.length > 0 &&
                        product.images[0].src
                      ) {
                        productsMap.set(
                          cartItem.product_id,
                          product.images[0].src
                        );
                      }
                    } catch {
                      // ignore
                    }
                  })
                );
              } catch {
                // ignore
              }
            }

            result.cart.items.forEach((cartItem) => {
              if (
                (!cartItem.product_image ||
                  cartItem.product_image.trim() === "") &&
                productsMap.has(cartItem.product_id)
              ) {
                cartItem.product_image =
                  productsMap.get(cartItem.product_id) || "";
              }

              const existing = currentItems[cartItem.product_id.toString()];
              const mapped = mapCartItemResponseToCartItem(cartItem, existing);
              itemsMap[mapped.id] = mapped;
            });
            set({ items: itemsMap, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserCart(state.currentUserId, next);
            }
            set({ items: next, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserCart(state.currentUserId, next);
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
            await clearCartApi();
            set({ items: {}, isLoading: false });
          } catch (error) {
            if (state.currentUserId) {
              saveUserCart(state.currentUserId, {});
            }
            set({ items: {}, isLoading: false });
          }
        } else {
          if (state.currentUserId) {
            saveUserCart(state.currentUserId, {});
          }
          set({ items: {} });
        }
      },
    }),
    {
      name: "bfb-cart",
      partialize: (s: CartState) => ({
        items: s.items,
        currentUserId: s.currentUserId,
      }),
    }
  )
);

export const selectCartList = (state: CartState) => Object.values(state.items);
export const selectCartCount = (state: CartState) =>
  Object.values(state.items).reduce((acc, it) => acc + it.quantity, 0);
export const selectCartTotal = (state: CartState) =>
  Object.values(state.items).reduce(
    (acc, it) => acc + it.price * it.quantity,
    0
  );

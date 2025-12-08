import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  color?: string;
  originalPrice?: number;
  sku?: string;
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
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: AddItemData, qty?: number) => void;
  removeItem: (id: string) => void;
  increment: (id: string, step?: number) => void;
  decrement: (id: string, step?: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items[item.id];
          const nextQty = (existing?.quantity || 0) + qty;
          const newItems = {
            ...state.items,
            [item.id]: {
              id: item.id,
              name: item.name,
              price: item.price,
              image: item.image,
              color: item.color,
              originalPrice: item.originalPrice,
              sku: item.sku,
              quantity: nextQty,
            },
          };
          return { items: newItems };
        });
      },
      removeItem: (id) => {
        set((state) => {
          const next = { ...state.items };
          delete next[id];
          return { items: next };
        });
      },
      increment: (id, step = 1) =>
        set((state) => {
          const item = state.items[id];
          if (!item) return {} as CartState;
          return {
            items: {
              ...state.items,
              [id]: { ...item, quantity: item.quantity + step },
            },
          };
        }),
      decrement: (id, step = 1) =>
        set((state) => {
          const item = state.items[id];
          if (!item) return {} as CartState;
          const newQty = item.quantity - step;
          const next = { ...state.items };
          if (newQty <= 0) delete next[id];
          else next[id] = { ...item, quantity: newQty };
          return { items: next };
        }),
      clear: () => set({ items: {} }),
    }),
    {
      name: "bfb-cart",
      partialize: (state) => ({ items: state.items }),
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

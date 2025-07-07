"use client";

import { CartItem } from "@/lib/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setIsOpen: (open: boolean) => void;
  setItems: (items: CartItem[]) => void;
}

async function syncCartWithServer(cart: CartItem[]) {
  try {
    await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cart }),
    });
  } catch (error) {
    console.error("Erro ao sincronizar carrinho com cookie:", error);
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items ?? [];
        const existingItem = items.find((item) => item.id === newItem.id);

        let updatedItems: CartItem[];

        if (existingItem) {
          if (existingItem.quantity < newItem.stock) {
            updatedItems = items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
            set({ items: updatedItems });
          } else {
            updatedItems = items;
          }
        } else {
          updatedItems = [...items, { ...newItem, quantity: 1 }];
          set({ items: updatedItems });
        }

        syncCartWithServer(updatedItems);
      },

      removeItem: (id) => {
        const items = get().items ?? [];
        const updatedItems = items.filter((item) => item.id !== id);
        set({ items: updatedItems });
        syncCartWithServer(updatedItems);
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const items = get().items ?? [];
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
        syncCartWithServer(updatedItems);
      },

      clearCart: () => {
        set({ items: [] });
        syncCartWithServer([]);
      },

      getTotalItems: () => {
        const items = get().items ?? [];
        return Array.isArray(items)
          ? items.reduce((acc, item) => acc + (item.quantity ?? 0), 0)
          : 0;
      },

      getTotalPrice: () => {
        const items = get().items ?? [];
        return Array.isArray(items)
          ? items.reduce(
              (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 0),
              0
            )
          : 0;
      },

      setIsOpen: (open) => {
        set({ isOpen: open });
      },

      setItems: (items) => {
        if (!Array.isArray(items)) return;
        const validItems = items.filter((item) => item && item.id && item.quantity);
        set({ items: validItems });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

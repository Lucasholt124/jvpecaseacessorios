"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CartItem } from "./types"

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  setIsOpen: (open: boolean) => void
  setItems: (items: CartItem[]) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items ?? []
        const existing = items.find((item) => item.id === newItem.id)

        if (existing) {
          if (existing.quantity < newItem.stock) {
            set({
              items: items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            })
          }
        } else {
          set({
            items: [...items, { ...newItem, quantity: 1 }],
          })
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + (item.quantity ?? 0), 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
          0
        )
      },

      setIsOpen: (open) => {
        set({ isOpen: open })
      },

      setItems: (items) => {
        const validItems = Array.isArray(items)
          ? items.filter((item) => item?.id && item?.quantity >= 0)
          : []
        set({ items: validItems })
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
)

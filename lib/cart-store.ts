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
        const items = Array.isArray(get().items) ? get().items : []
        const existingItem = items.find((item) => item.id === newItem.id)
        if (existingItem) {
          if (existingItem.quantity < newItem.stock) {
            set((state) => ({
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }))
          }
        } else {
          set((state) => ({
            items: [...items, { ...newItem, quantity: 1 }],
          }))
        }
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },
      clearCart: () => {
        set({ items: [] })
      },
      getTotalItems: () => {
        const items = Array.isArray(get().items) ? get().items : []
        return items.reduce((acc, item) => acc + item.quantity, 0)
      },
      getTotalPrice: () => {
        const items = Array.isArray(get().items) ? get().items : []
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
      },
      setIsOpen: (open) => {
        set({ isOpen: open })
      },
      setItems: (items) => {
        set({ items: Array.isArray(items) ? items : [] })
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
)

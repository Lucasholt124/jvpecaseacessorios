"use client"

import { create } from "zustand"
import { toast } from "react-hot-toast"

interface WishlistItem {
  id: string
  name: string
  slug: string
  image: string
}

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  fetchWishlist: () => Promise<void>
  addToWishlist: (item: WishlistItem) => Promise<void>
  removeFromWishlist: (id: string) => Promise<void>
  isInWishlist: (id: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true })
    try {
      const res = await fetch("/api/favoritos") // Sua rota API que retorna os favoritos do usuário
      if (!res.ok) throw new Error("Falha ao buscar favoritos")
      const data: WishlistItem[] = await res.json()
      set({ items: data })
    } catch (error) {
      toast.error("Erro ao carregar favoritos")
    } finally {
      set({ loading: false })
    }
  },

  addToWishlist: async (item) => {
    if (get().isInWishlist(item.id)) {
      toast("Produto já está nos favoritos")
      return
    }
    set({ loading: true })
    try {
      const res = await fetch("/api/favoritos/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.id }),
      })
      if (!res.ok) throw new Error("Erro ao adicionar favorito")
      set((state) => ({ items: [...state.items, item] }))
      toast.success("Produto adicionado aos favoritos")
    } catch (error) {
      toast.error("Erro ao adicionar favorito")
    } finally {
      set({ loading: false })
    }
  },

  removeFromWishlist: async (id) => {
    set({ loading: true })
    try {
      const res = await fetch("/api/favoritos/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      })
      if (!res.ok) throw new Error("Erro ao remover favorito")
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
      toast.success("Produto removido dos favoritos")
    } catch (error) {
      toast.error("Erro ao remover favorito")
    } finally {
      set({ loading: false })
    }
  },

  isInWishlist: (id) => get().items.some((item) => item.id === id),
}))

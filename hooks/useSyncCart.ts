"use client"

import { useCartStore } from "@/lib/cart-store"

export async function useSyncCartFromCookie(): Promise<void> {
  try {
    const res = await fetch("/api/cart", {
      method: "GET",
      credentials: "include",
    })
    if (!res.ok) throw new Error("Erro ao buscar carrinho")
    const data = await res.json()
    if (Array.isArray(data.cart)) {
      const mappedItems = data.cart.map((item: any) => ({
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        stock: item.product.stock,
        quantity: item.quantity,
      }))
      useCartStore.getState().setItems(mappedItems)
    }
  } catch (error) {
    console.error("Erro ao sincronizar carrinho:", error)
  }
}

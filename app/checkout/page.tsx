"use client"

import CheckoutForm from "@/components/checkout-form"
import { useCartStore } from "@/lib/cart-store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.getTotalPrice())
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  if (items.length === 0) {
    return null // Ou loading...
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CheckoutForm cartTotal={totalPrice} cartItems={totalItems} />
    </div>
  )
}

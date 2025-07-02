"use client"

import Link from "next/link"
import { useCartStore } from "@/lib/cart-store"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
        <Link href="/produtos">
          <Button>Voltar para Produtos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Seu Carrinho</h1>

      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 bg-yellow-500 p-4 rounded-lg">
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover rounded bg-red-500"
                sizes="96px"
                unoptimized
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-green-600 font-bold">{formatPrice(item.price)}</p>

              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8 p-0 bg-red-500 flex items-center justify-center"
                >
                  -
                </Button>

                <span className="w-8 text-center">{item.quantity}</span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="h-8 w-8 p-0 bg-red-500 flex items-center justify-center"
                >
                  +
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeItem(item.id)}
                >
                  Remover
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between items-center font-bold text-xl">
        <span>Total:</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>

      <div className="mt-6 flex gap-4">
        <Button onClick={clearCart} variant="outline" className="flex-1 bg-red-500">
          Limpar Carrinho
        </Button>

        <Link href="/checkout" className="flex-1">
          <Button className="w-full bg-green-600 hover:bg-green-700">Finalizar Compra</Button>
        </Link>
      </div>
    </div>
  )
}

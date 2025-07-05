// cart-client.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import CartSummary from "@/components/cart-summary-real"
import type { CartItem } from "@/lib/types"


interface LocalCartItem extends CartItem {
  description?: string;
}

interface User {
  email?: string
  name?: string
}

interface CartClientProps {
  initialCart: LocalCartItem[] // Usa LocalCartItem aqui
  user: User | null
}

export default function CartClient({ initialCart, user }: CartClientProps) {
  const [cart, setCart] = useState<LocalCartItem[]>(initialCart) // Usa LocalCartItem aqui
  const [loading, setLoading] = useState(false)

  async function updateCart(
    action: "add" | "remove" | "update",
    itemId: string,
    quantity?: number,
    product?: any // Adicionado para lidar com a ação 'add' se ela for usada aqui futuramente
  ) {
    setLoading(true)
    try {
      const payload: any = { action, id: itemId, quantity };
      if (product) {
        payload.product = product; // Inclui o produto apenas para a ação 'add'
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.success && Array.isArray(data.cart)) {
        // Assume que data.cart também terá a propriedade description,
        // pois ela vem do servidor.
        setCart(data.cart as LocalCartItem[])
      } else {
        alert("Erro ao atualizar o carrinho: " + (data.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao atualizar o carrinho")
    }
    setLoading(false)
  }

  function handleIncrease(item: LocalCartItem) { // Usa LocalCartItem aqui
    const newQuantity = item.quantity + 1
    if (item.stock && newQuantity > item.stock) return
    updateCart("update", item.id, newQuantity)
  }

  function handleDecrease(item: LocalCartItem) { // Usa LocalCartItem aqui
    const newQuantity = item.quantity - 1
    if (newQuantity <= 0) {
      updateCart("remove", item.id)
    } else {
      updateCart("update", item.id, newQuantity)
    }
  }

  function handleRemove(item: LocalCartItem) { // Usa LocalCartItem aqui
    updateCart("remove", item.id)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                <Button asChild>
                  <Link href="/produtos">Continuar Comprando</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {item.description ?? "Sem descrição"}
                        </p>
                        <p className="font-bold text-lg text-green-600">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            onClick={() => !loading && handleDecrease(item)}
                            disabled={loading}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            onClick={() =>
                              !loading && !(item.stock && item.quantity >= item.stock) && handleIncrease(item)
                            }
                            disabled={
                              loading || (item.stock ? item.quantity >= item.stock : false)
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label={`Remover ${item.name} do carrinho`}
                          onClick={() => handleRemove(item)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <CartSummary
            cart={cart}
            userEmail={user?.email ?? ""}
            userName={user?.name ?? ""}
          />
        </div>
      </div>
    </div>
  )
}
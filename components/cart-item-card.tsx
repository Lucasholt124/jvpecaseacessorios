"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2 } from "lucide-react"
import { updateCartQuantity, removeFromCart } from "@/lib/cart-actions"
import { formatPrice } from "@/lib/utils"
import type { CartItem } from "@/lib/types"
import { useRouter } from "next/navigation"

interface CartItemCardProps {
  item: CartItem
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    setIsUpdating(true)
    setQuantity(newQuantity)

    try {
      await updateCartQuantity(item.product._id, newQuantity)
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)
      setQuantity(item.quantity)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    setIsUpdating(true)
    try {
      await removeFromCart(item.product._id)
      router.refresh()
    } catch (error) {
      console.error("Erro ao remover item:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const subtotal = item.product.price * quantity

  return (
    <Card className={`transition-opacity duration-300 ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Imagem do Produto */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={item.product.image || "/placeholder.svg"}
              alt={item.product.name || "Produto"}
              fill
              className="object-cover rounded-lg"
              sizes="96px"
              unoptimized
            />
          </div>

          {/* Detalhes e Controles */}
          <div className="flex-1 flex flex-col gap-3 justify-between min-w-0">
            <div className="flex justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{item.product.name}</h3>
                {item.product.description && (
                  <p className="text-gray-600 text-sm mb-1 line-clamp-2">{item.product.description}</p>
                )}
              </div>

              {/* Botão de remover (acessível no mobile também) */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isUpdating}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Preço unitário */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">{formatPrice(item.product.price)}</span>
              <span className="text-sm text-gray-500">cada</span>
            </div>

            {/* Quantidade + Subtotal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Controles de quantidade */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isUpdating}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (!isNaN(value)) setQuantity(value)
                  }}
                  onBlur={() => handleQuantityChange(quantity)}
                  className="w-16 text-center"
                  disabled={isUpdating}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isUpdating}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Subtotal */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-xl font-bold text-primary">{formatPrice(subtotal)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

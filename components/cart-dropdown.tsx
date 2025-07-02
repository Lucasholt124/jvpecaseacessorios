"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { formatPrice } from "@/lib/utils"
import { toast } from "react-hot-toast"

export default function CartDropdown() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCartStore()

  const [isClearing, setIsClearing] = useState(false)

  const handleClearCart = async () => {
    setIsClearing(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    clearCart()
    setIsClearing(false)
    toast.success("Carrinho limpo!")
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-green-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir ou fechar carrinho"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-full">
            {totalItems > 99 ? "99+" : totalItems}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="
              fixed z-50 top-16 left-1/2 transform -translate-x-1/2
              bg-yellow-500 rounded-lg shadow-xl border
              max-h-[80vh] flex flex-col
              w-full max-w-[520px]
              p-4
            "
            style={{ minWidth: "280px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b">
              <h3 className="font-semibold text-lg">
                Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-auto"
                aria-label="Fechar carrinho"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-900 mb-4" />
                  <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                  <Button asChild onClick={() => setIsOpen(false)}>
                    <Link href="/produtos">Continuar Comprando</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-2 space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="
                        flex gap-3 p-3 bg-gray-800 rounded-lg
                        flex-col sm:flex-row items-center
                      "
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 sm:w-24 sm:h-24">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name || "Produto"}
                          fill
                          className="object-cover rounded"
                          sizes="96px"
                          unoptimized
                        />
                      </div>

                      <div className="flex-1 min-w-0 bg-gray-800 p-2 rounded-lg">
                        <Link
                          href={`/produto/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="font-medium text-base sm:text-sm hover:text-blue-600 line-clamp-2"
                        >
                          {item.name}
                        </Link>

                        <div
                          className="
                            flex items-center justify-between mt-2
                            flex-col sm:flex-row
                            gap-2
                          "
                        >
                          <span className="font-bold text-green-600 text-lg">
                            {formatPrice(item.price)}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-red-500 flex items-center justify-center"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-red-500 flex items-center justify-center"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
                              onClick={() => {
                                removeItem(item.id)
                                toast.success("Item removido do carrinho")
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {item.quantity >= item.stock && (
                          <p className="text-xs text-orange-600 mt-1">Estoque máximo atingido</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-2 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-base">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                  <Button
                    asChild
                    className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">Finalizar Compra</Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 bg-red-500"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/carrinho">Ver Carrinho</Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {isClearing ? "Limpando..." : "Limpar"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

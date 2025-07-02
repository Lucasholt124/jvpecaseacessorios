import { getCart } from "@/lib/cart-actions"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import CartSummary from "@/components/cart-summary-real"

export default async function CartPage() {
  const user = await getCurrentUser()
  const cart = await getCart()

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
                  <a href="/produtos">Continuar Comprando</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.product._id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.product.description}</p>
                        <p className="font-bold text-lg">R$ {item.product.price.toFixed(2)}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Button variant="destructive" size="sm">
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

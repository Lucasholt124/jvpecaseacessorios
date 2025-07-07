"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { CartItem } from "@/lib/types"
import CheckoutButton from "./checkout-button"
import { formatPrice, calculateShipping, getShippingMessage } from "@/lib/utils"

interface CartSummaryProps {
  cart: CartItem[]
  userEmail: string
  userName?: string
}

export default function CartSummary({ cart, userEmail, userName }: CartSummaryProps) {
  const [subtotal, setSubtotal] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [total, setTotal] = useState(0)
  const [shippingMessage, setShippingMessage] = useState("")

  useEffect(() => {
    const updateValues = () => {
      const newSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const newShipping = calculateShipping(newSubtotal)
      const newTotal = newSubtotal + newShipping
      const newMessage = getShippingMessage(newSubtotal)

      setSubtotal(newSubtotal)
      setShipping(newShipping)
      setTotal(newTotal)
      setShippingMessage(newMessage)
    }

    updateValues()
  }, [cart])

  if (cart.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Seu carrinho está vazio
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resumo do Pedido</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-3 text-sm">
          {/* Subtotal */}
          <div className="flex justify-between">
            <span>
              Subtotal ({cart.length} {cart.length === 1 ? "item" : "itens"})
            </span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {/* Frete */}
          <div className="flex justify-between items-center">
            <span>Frete</span>
            {shipping === 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                GRÁTIS
              </Badge>
            ) : (
              <span className="font-medium">{formatPrice(shipping)}</span>
            )}
          </div>

          {/* Dica de frete grátis */}
          {shipping > 0 && (
            <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
              💡 {shippingMessage}
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center text-base font-bold">
          <span>Total</span>
          <span className="text-green-600">{formatPrice(total)}</span>
        </div>

        {/* Botão de checkout */}
        <CheckoutButton
          userEmail={userEmail}
          userName={userName}
          disabled={cart.length === 0}
        />

        {/* Informações de segurança */}
        <div className="space-y-1 text-xs text-gray-500 text-center mt-4">
          <p>✅ Pagamento seguro via Mercado Pago</p>
          <p>🚚 Frete grátis em compras acima de R$ 100,00</p>
          <p>📦 Entrega estimada: 5 a 10 dias úteis</p>
        </div>
      </CardContent>
    </Card>
  )
}

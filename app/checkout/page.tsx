
import { getCart, getCartTotal, getCartItemsCount } from "@/lib/cart-actions"
import CheckoutForm from "@/components/checkout-form"
import { redirect } from "next/navigation"

export default async function CheckoutPage() {
  const cart = await getCart()

  // Redireciona se o carrinho estiver vazio (baseado no cookie)
  if (!cart || cart.length === 0) {
    redirect("/cart")
  }

  const cartTotal = await getCartTotal()
  const cartItems = await getCartItemsCount()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CheckoutForm cartTotal={cartTotal} cartItems={cartItems} />
    </div>
  )
}

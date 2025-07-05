import { getCart } from "@/lib/cart-actions"
import { getCurrentUser } from "@/lib/auth"
import CartClient from "./cart-client"

export default async function CartPage() {
  const user = await getCurrentUser()
  const cart = await getCart()

  return <CartClient initialCart={cart} user={user} />
}

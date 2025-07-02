import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { Product, CartItem } from "@/lib/types"

const COOKIE_NAME = "cart"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

function parseCartCookie(cookieValue: string | undefined): CartItem[] {
  if (!cookieValue) return []
  try {
    const parsed = JSON.parse(cookieValue)
    if (Array.isArray(parsed)) return parsed
  } catch {}
  return []
}

function serializeCartCookie(cart: CartItem[]) {
  return `cart=${encodeURIComponent(JSON.stringify(cart))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`
}

export async function GET() {
  const cookieStore = await cookies() // <-- await aqui
  const cartCookie = cookieStore.get(COOKIE_NAME)?.value
  const cart = parseCartCookie(cartCookie)

  return NextResponse.json({ success: true, cart })
}

export async function POST(request: Request) {
  const cookieStore = await cookies() // <-- await aqui também
  const cartCookie = cookieStore.get(COOKIE_NAME)?.value
  let cart = parseCartCookie(cartCookie)

  try {
    const { action, product, quantity, productId } = await request.json()

    switch (action) {
      case "add":
        if (!product || !product._id) throw new Error("Produto inválido")
        {
          const idx = cart.findIndex((item) => item.product._id === product._id)
          if (idx > -1) {
            cart[idx].quantity += quantity ?? 1
          } else {
            cart.push({ product, quantity: quantity ?? 1 })
          }
        }
        break

      case "remove":
        if (!productId) throw new Error("productId é obrigatório")
        cart = cart.filter((item) => item.product._id !== productId)
        break

      case "update":
        if (!productId) throw new Error("productId é obrigatório")
        if (quantity === undefined || quantity < 0) throw new Error("quantity inválido")
        {
          const idx = cart.findIndex((item) => item.product._id === productId)
          if (idx > -1) {
            if (quantity === 0) {
              cart.splice(idx, 1)
            } else {
              cart[idx].quantity = quantity
            }
          }
        }
        break

      case "clear":
        cart = []
        break

      default:
        throw new Error("Ação inválida")
    }

    const response = NextResponse.json({ success: true, cart })
    response.headers.append("Set-Cookie", serializeCartCookie(cart))
    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 })
  }
}

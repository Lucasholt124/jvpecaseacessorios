import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import type { CartItem } from "@/lib/types"

const COOKIE_NAME = "cart"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

function parseCartCookie(cookieValue: string | undefined): CartItem[] {
  if (!cookieValue) return []
  try {
    const parsed = JSON.parse(cookieValue)
    if (Array.isArray(parsed)) return parsed
  } catch (err) {
    console.error("Erro ao fazer parse do cookie do carrinho:", err)
  }
  return []
}

function serializeCartCookie(cart: CartItem[]) {
  return `cart=${encodeURIComponent(JSON.stringify(cart))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`
}

export async function GET() {
  const cookieStore = cookies()
  const cartCookie = cookieStore.get(COOKIE_NAME)?.value
  const cart = parseCartCookie(cartCookie)
  return NextResponse.json({ success: true, cart })
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const cartCookie = cookieStore.get(COOKIE_NAME)?.value
  let cart = parseCartCookie(cartCookie)

  try {
    const { action, product, id, quantity } = await request.json()

    switch (action) {
      case "add": {
        if (!product || !product.id || (quantity ?? 1) <= 0) {
          throw new Error("Produto inválido")
        }
        const idx = cart.findIndex((item) => item.id === product.id)
        if (idx > -1) {
          cart[idx].quantity = Math.min(cart[idx].quantity + (quantity ?? 1), product.stock)
        } else {
          cart.push({ ...product, quantity: quantity ?? 1 })
        }
        break
      }
      case "remove": {
        if (!id) throw new Error("id é obrigatório para remover")
        cart = cart.filter((item) => item.id !== id)
        break
      }
      case "update": {
        if (!id) throw new Error("id é obrigatório para atualizar")
        if (quantity === undefined || quantity < 0) throw new Error("quantity inválido")
        const idx = cart.findIndex((item) => item.id === id)
        if (idx > -1) {
          if (quantity === 0) {
            cart.splice(idx, 1)
          } else {
            cart[idx].quantity = quantity
          }
        }
        break
      }
      case "clear": {
        cart = []
        break
      }
      default:
        throw new Error("Ação inválida")
    }

    const response = NextResponse.json({ success: true, cart })
    response.headers.append("Set-Cookie", serializeCartCookie(cart))
    return response
  } catch (error) {
    console.error("Erro ao processar ação do carrinho:", error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Carrinho limpo" })
  response.headers.append("Set-Cookie", `cart=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  return response
}

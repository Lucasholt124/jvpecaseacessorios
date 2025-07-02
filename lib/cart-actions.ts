"use server"

import { cookies } from "next/headers"
import type { CartItem, Product } from "./types"
import { NextResponse } from "next/server"
import { serialize } from "cookie"

// Pega os itens do carrinho a partir do cookie
export async function getCart(): Promise<CartItem[]> {
  try {
    const cookieStore = await cookies() // <-- uso de await necessário
    const cartCookie = cookieStore.get("cart")

    if (!cartCookie?.value) return []

    const cart = JSON.parse(cartCookie.value)
    return Array.isArray(cart) ? cart : []
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error)
    return []
  }
}

// Cria a resposta com o carrinho atualizado e seta cookie
function createCartResponse(cart: CartItem[]) {
  const response = NextResponse.json({ success: true, cart })

  response.headers.append(
    "Set-Cookie",
    serialize("cart", JSON.stringify(cart), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    }),
  )

  return response
}

// Adiciona um item ao carrinho
export async function addToCart(product: Product, quantity = 1) {
  try {
    if (!product || !product._id || quantity <= 0) {
      throw new Error("Dados do produto inválidos")
    }

    const currentCart = await getCart()
    const existingItemIndex = currentCart.findIndex((item) => item.product._id === product._id)

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += quantity
    } else {
      currentCart.push({ product, quantity })
    }

    return createCartResponse(currentCart)
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error)
    return NextResponse.json({ success: false, error: "Erro ao adicionar produto ao carrinho" }, { status: 500 })
  }
}

// Remove item do carrinho
export async function removeFromCart(productId: string) {
  try {
    if (!productId) {
      throw new Error("ID do produto é obrigatório")
    }

    const currentCart = await getCart()
    const updatedCart = currentCart.filter((item) => item.product._id !== productId)

    return createCartResponse(updatedCart)
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error)
    return NextResponse.json({ success: false, error: "Erro ao remover produto do carrinho" }, { status: 500 })
  }
}

// Atualiza a quantidade de um item no carrinho
export async function updateCartQuantity(productId: string, quantity: number) {
  try {
    if (!productId || quantity < 0) {
      throw new Error("Dados inválidos")
    }

    const currentCart = await getCart()
    const itemIndex = currentCart.findIndex((item) => item.product._id === productId)

    if (itemIndex > -1) {
      if (quantity <= 0) {
        currentCart.splice(itemIndex, 1)
      } else {
        currentCart[itemIndex].quantity = quantity
      }
    }

    return createCartResponse(currentCart)
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error)
    return NextResponse.json({ success: false, error: "Erro ao atualizar quantidade" }, { status: 500 })
  }
}

// Limpa o carrinho
export async function clearCart() {
  try {
    const response = NextResponse.json({ success: true })

    response.headers.append(
      "Set-Cookie",
      serialize("cart", "", {
        path: "/",
        maxAge: 0,
      }),
    )

    return response
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error)
    return NextResponse.json({ success: false, error: "Erro ao limpar carrinho" }, { status: 500 })
  }
}

// Soma total em reais do carrinho
export async function getCartTotal(): Promise<number> {
  try {
    const cart = await getCart()
    return cart.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0)
  } catch (error) {
    console.error("Erro ao calcular total:", error)
    return 0
  }
}

// Conta quantos itens no total há no carrinho
export async function getCartItemsCount(): Promise<number> {
  try {
    const cart = await getCart()
    return cart.reduce((total, item) => total + item.quantity, 0)
  } catch (error) {
    console.error("Erro ao contar itens:", error)
    return 0
  }
}

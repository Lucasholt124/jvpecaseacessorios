"use server"

import { preference } from "./mercadopago"
import { getCart, clearCart } from "./cart-actions"
import type { PaymentData, MercadoPagoItem } from "./types"
import { redirect } from "next/navigation"

export async function createMercadoPagoPreference(
  userEmail: string,
  userName?: string,
  userPhone?: { area_code: string; number: string },
) {
  try {
    const cart = await getCart()

    if (!cart || cart.length === 0) {
      throw new Error("Carrinho vazio")
    }

    const items: MercadoPagoItem[] = cart.map((item) => ({
      id: item.product._id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: "BRL",
      picture_url: item.product.image,
      description: item.product.description,
    }))

    const externalReference = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`

    const paymentData: PaymentData = {
      items,
      payer: {
        email: userEmail,
        ...(userName && { name: userName }),
        ...(userPhone && { phone: userPhone }),
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/mercadopago/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/mercadopago/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/mercadopago/pending`,
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhooks`,
      external_reference: externalReference,
    }

    const response = await preference.create({
      body: paymentData,
    })

    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      externalReference,
    }
  } catch (error) {
    console.error("❌ Erro ao criar preferência do Mercado Pago:", error)
    throw new Error("Falha ao processar pagamento")
  }
}

export async function processPaymentSuccess(paymentId: string, externalReference: string) {
  try {
    // Aqui você pode persistir os dados do pedido no banco com Prisma

    await clearCart()

    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao processar sucesso do pagamento:", error)
    return { success: false, error: "Erro interno" }
  }
}

export async function redirectToCheckout(preferenceId: string) {
  const isProduction = process.env.NODE_ENV === "production"

  const checkoutUrl = isProduction
    ? `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`
    : `https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`

  redirect(checkoutUrl)
}

"use server"

import { preference } from "./mercadopago"
import { getCart, clearCart } from "./cart-actions"
import type { MercadoPagoItem } from "./types"
import { storeTempCartData } from "./cart-storage"
import { generateOrderId, calculateShipping } from "./utils"
import { umamiTrackCheckoutSuccessEvent } from "./umami-enhanced"

interface CustomerData {
  email: string
  name: string
  phone: {
    area_code: string
    number: string
  }
  address: {
    zip_code: string
    street_name: string
    street_number: string | number
    neighborhood: string
    city: string
    state: string
    complement?: string
  }
}

export async function createMercadoPagoPreference(customerData: CustomerData) {
  try {
    const cart = await getCart()
    if (!cart.length) throw new Error("Carrinho vazio")

    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const shippingCost = calculateShipping(subtotal)

    const items: MercadoPagoItem[] = cart.map((item) => ({
      id: item.product._id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: "BRL",
      picture_url: item.product.image,
      description: item.product.description,
    }))

    if (shippingCost > 0) {
      items.push({
        id: "shipping",
        title: "Frete",
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "BRL",
      })
    }

    const externalReference = generateOrderId()

    const paymentData = {
      items,
      payer: {
        name: customerData.name,
        email: customerData.email,
        phone: {
          area_code: customerData.phone.area_code,
          number: customerData.phone.number,
        },
        address: {
          zip_code: customerData.address.zip_code,
          street_name: customerData.address.street_name,
          street_number: String(customerData.address.street_number),
          neighborhood: customerData.address.neighborhood,
          city: customerData.address.city,
          federal_unit: customerData.address.state,
        },
      },
      shipments: {
        receiver_address: {
          zip_code: customerData.address.zip_code,
          street_name: customerData.address.street_name,
          street_number: String(customerData.address.street_number),
          neighborhood: customerData.address.neighborhood,
          city_name: customerData.address.city,
          state_name: customerData.address.state,
          apartment: customerData.address.complement || "",
        },
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/mercadopago/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/mercadopago/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/mercadopago/pending`,
      },
      auto_return: "approved" as const,
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhooks`,
      external_reference: externalReference,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    const response = await preference.create({ body: paymentData })

    await storeTempCartData(externalReference, cart, {
      ...customerData,
      subtotal,
      shipping: shippingCost,
      total: subtotal + shippingCost,
    })

    console.log("✅ Preferência criada:", response.id)

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
    await umamiTrackCheckoutSuccessEvent({
      orderId: externalReference,
      paymentId,
      amount: 0, // Será atualizado via webhook depois
      timestamp: new Date(),
    })

    await clearCart()

    console.log("✅ Pagamento processado com sucesso:", externalReference)
    return { success: true, orderId: externalReference }
  } catch (error) {
    console.error("❌ Erro ao processar sucesso do pagamento:", error)
    return { success: false, error: "Erro interno" }
  }
}

export async function getShippingQuote(subtotal: number) {
  try {
    const cost = calculateShipping(subtotal)
    const isFree = cost === 0

    return {
      success: true,
      cost,
      isFree,
      estimatedDays: "5-10 dias úteis",
      message: isFree ? "Frete GRÁTIS" : `Frete: R$ ${cost.toFixed(2)}`,
    }
  } catch (error) {
    console.error("❌ Erro ao calcular frete:", error)
    return {
      success: false,
      cost: 0,
      isFree: false,
      estimatedDays: "",
      message: "Erro ao calcular frete",
    }
  }
}

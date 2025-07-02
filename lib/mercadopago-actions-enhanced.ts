"use server"

import { preference } from "./mercadopago"
import { getCart } from "./cart-actions"
import type { MercadoPagoItem } from "./types"
import { storeTempCartData } from "./cart-storage"

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

export async function createEnhancedMercadoPagoPreference(customerData: CustomerData) {
  try {
    const cart = await getCart()

    if (cart.length === 0) throw new Error("Carrinho vazio")

    const subtotal = cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    )

    const shippingCost = 10 // valor fixo de frete por enquanto

    const items: MercadoPagoItem[] = cart.map((item) => ({
      id: item.product._id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: "BRL",
      picture_url: item.product.image,
      description: item.product.description,
    }))

    items.push({
      id: "shipping",
      title: "Frete",
      quantity: 1,
      unit_price: shippingCost,
      currency_id: "BRL",
    })

    const externalReference = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
    }

    const response = await preference.create({ body: paymentData })

    await storeTempCartData(externalReference, cart, {
      ...customerData,
      subtotal,
      shipping: shippingCost,
      total: subtotal + shippingCost,
    })

    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      externalReference,
    }
  } catch (error) {
    console.error("Erro ao criar preferência do Mercado Pago:", error)
    throw new Error("Falha ao processar pagamento")
  }
}

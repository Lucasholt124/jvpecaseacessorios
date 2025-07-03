"use server"

import { preference } from "./mercadopago"
import { getCart, clearCart } from "./cart-actions"
import { storeTempCartData } from "./cart-storage"
import { generateOrderId } from "./utils"
import { prisma } from "./prisma"
import { umamiTrackCheckoutSuccessEvent } from "./umami-enhanced"
import type { MercadoPagoItem } from "./types"

enum PaymentStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

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
  couponCode?: string
}

export async function createMercadoPagoPreference(customerData: CustomerData) {
  try {
    const cart = await getCart()
    if (!cart.length) throw new Error("Carrinho vazio")

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    let discount = 0
    if (customerData.couponCode) {
      discount = await calculateCouponDiscount(customerData.couponCode, subtotal)
    }

    const shippingCost = await calculateShipping(customerData.address.zip_code)

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

    if (discount > 0) {
      items.push({
        id: "discount",
        title: `Desconto (${customerData.couponCode})`,
        quantity: 1,
        unit_price: -discount,
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
      discount,
      total: subtotal + shippingCost - discount,
    })

    return {
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      externalReference,
    }
  } catch (error) {
    console.error("❌ Erro ao criar preferência:", error)
    throw new Error("Falha ao processar pagamento")
  }
}

export async function processPaymentSuccess(paymentId: string, externalReference: string) {
  try {
    await umamiTrackCheckoutSuccessEvent({
      orderId: externalReference,
      paymentId,
      amount: 0,
      timestamp: new Date(),
    })

    await clearCart()

    return { success: true, orderId: externalReference }
  } catch (error) {
    console.error("❌ Erro ao processar sucesso:", error)
    return { success: false, error: "Erro interno" }
  }
}

async function calculateCouponDiscount(couponCode: string, subtotal: number): Promise<number> {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        isActive: true,
        validUntil: { gte: new Date() },
      },
    })

    if (!coupon) return 0

    if (coupon.type === "PERCENTAGE") {
      return Math.min(subtotal * (coupon.value / 100), coupon.maxDiscount || subtotal)
    } else if (coupon.type === "FIXED") {
      return Math.min(coupon.value, subtotal)
    }

    return 0
  } catch (error) {
    console.error("❌ Erro ao calcular desconto:", error)
    return 0
  }
}

async function calculateShipping(zipCode: string): Promise<number> {
  try {
    const cleanZip = zipCode.replace(/\D/g, "")
    const region = cleanZip.substring(0, 2)

    const shippingTable: Record<string, number> = {
      "01": 15, "02": 15, "03": 15, "04": 15, "05": 15,
      "20": 12, "21": 12, "22": 12, "23": 12, "24": 12,
      "30": 18, "31": 18,
      "40": 25, "41": 25,
      "50": 30, "51": 30,
      "60": 35,
      "70": 20,
      "80": 22,
      "90": 28,
    }

    return shippingTable[region] || 25
  } catch (error) {
    console.error("❌ Erro ao calcular frete:", error)
    return 15
  }
}

export async function validateCoupon(couponCode: string, subtotal: number) {
  try {
    const discount = await calculateCouponDiscount(couponCode, subtotal)

    return {
      valid: discount > 0,
      discount,
      message: discount > 0
        ? `Cupom aplicado! Desconto de R$ ${discount.toFixed(2)}`
        : "Cupom inválido ou expirado",
    }
  } catch (error) {
    console.error("❌ Erro ao validar cupom:", error)
    return {
      valid: false,
      discount: 0,
      message: "Erro ao validar cupom",
    }
  }
}

export async function getShippingQuote(zipCode: string) {
  try {
    const cost = await calculateShipping(zipCode)
    return {
      success: true,
      cost,
      estimatedDays: "5-10 dias úteis",
      message: `Frete: R$ ${cost.toFixed(2)}`,
    }
  } catch (error) {
    console.error("❌ Erro ao calcular frete:", error)
    return {
      success: false,
      cost: 0,
      estimatedDays: "",
      message: "Erro ao calcular frete",
    }
  }
}

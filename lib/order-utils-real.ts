"use server"

import {
  sendOrderConfirmationEmail,
  sendPaymentPendingEmail,
  sendPaymentRejectedEmail,
} from "./email-enhanced"
import type { CartItem } from "./types"

interface PaymentInfo {
  id: number | string
  status: "approved" | "pending" | "rejected" | string
  external_reference: string
  transaction_amount: number
  payment_method_id: string
  payer: {
    email: string
    first_name?: string
    last_name?: string
    phone?: {
      area_code: string
      number: string
    }
  }
  additional_info?: {
    shipments?: {
      receiver_address?: {
        zip_code: string
        street_name: string
        street_number: number | string
        neighborhood: string
        city_name: string
        state_name: string
        apartment?: string
      }
    }
  }
}

export async function processOrderEmail(paymentInfo: PaymentInfo, cart: CartItem[]) {
  try {
    // Calcular subtotal
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    // Regra de frete: grátis para subtotal >= 100, senão R$40
    const shipping = subtotal >= 100 ? 0 : 40
    const total = subtotal + shipping

    // Preparar dados do pedido para email
    const orderData = {
      orderId: paymentInfo.external_reference || `order_${Date.now()}`,
      customerName:
        `${paymentInfo.payer?.first_name || ""} ${paymentInfo.payer?.last_name || ""}`.trim() || "Cliente",
      customerEmail: paymentInfo.payer?.email || "",
      items: cart,
      subtotal,
      shipping,
      total,
      paymentMethod: getPaymentMethodName(paymentInfo.payment_method_id),
      paymentId: String(paymentInfo.id),
      address: {
        street_name: paymentInfo.additional_info?.shipments?.receiver_address?.street_name || "",
        street_number:
          String(paymentInfo.additional_info?.shipments?.receiver_address?.street_number || ""),
        neighborhood: paymentInfo.additional_info?.shipments?.receiver_address?.neighborhood || "",
        city: paymentInfo.additional_info?.shipments?.receiver_address?.city_name || "",
        state: paymentInfo.additional_info?.shipments?.receiver_address?.state_name || "",
        zip_code: paymentInfo.additional_info?.shipments?.receiver_address?.zip_code || "",
        complement: paymentInfo.additional_info?.shipments?.receiver_address?.apartment || "",
      },
      phone: {
        area_code: paymentInfo.payer?.phone?.area_code || "",
        number: paymentInfo.payer?.phone?.number || "",
      },
    }

    // Enviar email adequado conforme status do pagamento
    switch (paymentInfo.status.toLowerCase()) {
      case "approved":
        await sendOrderConfirmationEmail(orderData)
        console.log(`✅ Email de confirmação enviado para: ${orderData.customerEmail}`)
        break
      case "pending":
        await sendPaymentPendingEmail(orderData)
        console.log(`⏳ Email de pagamento pendente enviado para: ${orderData.customerEmail}`)
        break
      case "rejected":
        await sendPaymentRejectedEmail(orderData)
        console.log(`❌ Email de pagamento rejeitado enviado para: ${orderData.customerEmail}`)
        break
      default:
        console.log(`⚠️ Status de pagamento desconhecido: ${paymentInfo.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao processar email do pedido:", error)
    return { success: false, error }
  }
}

function getPaymentMethodName(paymentMethodId: string): string {
  const paymentMethods: Record<string, string> = {
    pix: "PIX",
    bolbradesco: "Boleto Bancário",
    visa: "Cartão Visa",
    master: "Cartão Mastercard",
    amex: "Cartão American Express",
    elo: "Cartão Elo",
    hipercard: "Cartão Hipercard",
    account_money: "Saldo Mercado Pago",
  }
  return paymentMethods[paymentMethodId] || "Cartão de Crédito/Débito"
}

// Função auxiliar para logar pedido no console
export async function logOrderInfo(paymentInfo: PaymentInfo) {
  try {
    console.log("📋 INFORMAÇÕES DO PEDIDO:")
    console.log("ID do Pagamento:", String(paymentInfo.id ?? "N/A"))
    console.log("Referência Externa:", paymentInfo.external_reference ?? "N/A")
    console.log("Status:", paymentInfo.status ?? "N/A")
    console.log("Valor:", paymentInfo.transaction_amount ?? 0)
    console.log("Método de Pagamento:", paymentInfo.payment_method_id ?? "N/A")
    console.log("Email do Pagador:", paymentInfo.payer?.email ?? "N/A")
    console.log(
      "Nome do Pagador:",
      `${paymentInfo.payer?.first_name ?? ""} ${paymentInfo.payer?.last_name ?? ""}`.trim() || "N/A",
    )
    console.log("Data:", new Date().toISOString())
    console.log("---")

    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao fazer log do pedido:", error)
    return { success: false, error }
  }
}

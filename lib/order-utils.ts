"use server"

import { sendOrderConfirmationEmail, sendPaymentPendingEmail } from "./email"
import type { CartItem } from "./types"

interface PaymentInfo {
  id: string
  status: string
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
        street_number: number
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
    // Calcular totais
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const shipping = 10
    const total = subtotal + shipping

    // Preparar dados do pedido
    const orderData = {
      orderId: paymentInfo.external_reference,
      customerName: `${paymentInfo.payer.first_name || ""} ${paymentInfo.payer.last_name || ""}`.trim() || "Cliente",
      customerEmail: paymentInfo.payer.email,
      items: cart,
      subtotal,
      shipping,
      total,
      paymentMethod: getPaymentMethodName(paymentInfo.payment_method_id),
      paymentId: paymentInfo.id.toString(),
      address: {
        street_name: paymentInfo.additional_info?.shipments?.receiver_address?.street_name || "",
        street_number: paymentInfo.additional_info?.shipments?.receiver_address?.street_number?.toString() || "",
        neighborhood: paymentInfo.additional_info?.shipments?.receiver_address?.neighborhood || "",
        city: paymentInfo.additional_info?.shipments?.receiver_address?.city_name || "",
        state: paymentInfo.additional_info?.shipments?.receiver_address?.state_name || "",
        zip_code: paymentInfo.additional_info?.shipments?.receiver_address?.zip_code || "",
        complement: paymentInfo.additional_info?.shipments?.receiver_address?.apartment || "",
      },
      phone: {
        area_code: paymentInfo.payer.phone?.area_code || "",
        number: paymentInfo.payer.phone?.number || "",
      },
    }

    // Enviar email baseado no status
    if (paymentInfo.status === "approved") {
      await sendOrderConfirmationEmail(orderData)
      console.log(`Email de confirmação enviado para: ${orderData.customerEmail}`)
    } else if (paymentInfo.status === "pending") {
      await sendPaymentPendingEmail(orderData)
      console.log(`Email de pagamento pendente enviado para: ${orderData.customerEmail}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao processar email do pedido:", error)
    return { success: false, error }
  }
}

function getPaymentMethodName(paymentMethodId: string): string {
  const paymentMethods: { [key: string]: string } = {
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

export async function saveOrderToDatabase(paymentInfo: PaymentInfo) {
  try {
    // Aqui você salvaria no banco de dados usando Prisma
    // Exemplo:
    /*
    const order = await prisma.order.create({
      data: {
        paymentId: paymentInfo.id.toString(),
        externalReference: paymentInfo.external_reference,
        status: paymentInfo.status,
        amount: paymentInfo.transaction_amount,
        payerEmail: paymentInfo.payer.email,
        payerName: `${paymentInfo.payer.first_name || ''} ${paymentInfo.payer.last_name || ''}`.trim(),
        paymentMethod: paymentInfo.payment_method_id,
        createdAt: new Date(),
        // Adicionar outros campos conforme necessário
      }
    })

    console.log('Pedido salvo no banco:', order.id)
    */

    console.log("Pedido processado:", paymentInfo.external_reference)
    return { success: true }
  } catch (error) {
    console.error("Erro ao salvar pedido no banco:", error)
    return { success: false, error }
  }
}

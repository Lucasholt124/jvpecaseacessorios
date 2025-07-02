import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { processOrderEmail, logOrderInfo } from "@/lib/order-utils-real"
import { getTempCartData, clearTempCartData } from "@/lib/cart-storage"

// Tipo simplificado para o pagamento recebido do Mercado Pago
type SimplePaymentInfo = {
  id?: number | string
  status?: string
  external_reference?: string
  transaction_amount?: number
  payment_method_id?: string
  payer?: any
  // adicione outros campos que usar
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

const payment = new Payment(client)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("📥 Webhook recebido:", JSON.stringify(body, null, 2))

    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id

      try {
        const paymentInfo = (await payment.get({ id: paymentId })) as SimplePaymentInfo

        console.log("💳 Detalhes do pagamento:", JSON.stringify(paymentInfo, null, 2))

        if (paymentInfo.id === undefined) {
          throw new Error("Pagamento retornado sem id")
        }

        await logOrderInfo({
          ...paymentInfo,
          status: paymentInfo.status ?? "unknown"
        } as any)

        switch (paymentInfo.status) {
          case "approved":
            await processApprovedPayment(paymentInfo)
            break

          case "pending":
            await processPendingPayment(paymentInfo)
            break

          case "rejected":
            await processRejectedPayment(paymentInfo)
            break

          default:
            console.log("⚠️ Status de pagamento não tratado:", paymentInfo.status)
        }
      } catch (paymentError) {
        console.error("❌ Erro ao buscar detalhes do pagamento:", paymentError)
        return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
      }
    } else {
      console.log("ℹ️ Webhook ignorado - não é notificação de pagamento")
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Erro no webhook do Mercado Pago:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

async function processApprovedPayment(paymentInfo: SimplePaymentInfo) {
  if (!paymentInfo.id) {
    console.warn("Pagamento sem id")
    return
  }

  try {
    console.log("✅ Processando pagamento aprovado:", String(paymentInfo.id))

    const extRef = paymentInfo.external_reference ?? ""
    const tempData = await getTempCartData(extRef)

    if (tempData) {
      await processOrderEmail({
        ...paymentInfo,
        id: paymentInfo.id ?? "",
        status: paymentInfo.status ?? "unknown",
        external_reference: paymentInfo.external_reference ?? "",
        transaction_amount: paymentInfo.transaction_amount ?? 0,
        payment_method_id: paymentInfo.payment_method_id ?? "",
        payer: paymentInfo.payer ?? {}
      }, tempData.cart)
      await clearTempCartData(extRef)
      console.log("✅ Pagamento aprovado processado com sucesso:", String(paymentInfo.id))
    } else {
      console.log("⚠️ Dados do carrinho não encontrados para:", extRef)
    }
  } catch (error) {
    console.error("❌ Erro ao processar pagamento aprovado:", error)
  }
}

async function processPendingPayment(paymentInfo: SimplePaymentInfo) {
  if (!paymentInfo.id) {
    console.warn("Pagamento sem id")
    return
  }

  try {
    console.log("⏳ Processando pagamento pendente:", String(paymentInfo.id))

    const extRef = paymentInfo.external_reference ?? ""
    const tempData = await getTempCartData(extRef)

    if (tempData) {
      await processOrderEmail({
        ...paymentInfo,
        id: paymentInfo.id ?? "",
        status: paymentInfo.status ?? "unknown",
        external_reference: paymentInfo.external_reference ?? "",
        transaction_amount: paymentInfo.transaction_amount ?? 0,
        payment_method_id: paymentInfo.payment_method_id ?? "",
        payer: paymentInfo.payer ?? {}
      }, tempData.cart)
      console.log("⏳ Pagamento pendente processado:", String(paymentInfo.id))
    } else {
      console.log("⚠️ Dados do carrinho não encontrados para:", extRef)
    }
  } catch (error) {
    console.error("❌ Erro ao processar pagamento pendente:", error)
  }
}

async function processRejectedPayment(paymentInfo: SimplePaymentInfo) {
  if (!paymentInfo.id) {
    console.warn("Pagamento sem id")
    return
  }

  try {
    console.log("❌ Processando pagamento rejeitado:", String(paymentInfo.id))

    const extRef = paymentInfo.external_reference ?? ""
    const tempData = await getTempCartData(extRef)

    if (tempData) {
      await processOrderEmail({
        ...paymentInfo,
        id: paymentInfo.id ?? "",
        status: paymentInfo.status ?? "unknown",
        external_reference: paymentInfo.external_reference ?? "",
        transaction_amount: paymentInfo.transaction_amount ?? 0,
        payment_method_id: paymentInfo.payment_method_id ?? "",
        payer: paymentInfo.payer ?? {}
      }, tempData.cart)
      await clearTempCartData(extRef)
      console.log("❌ Pagamento rejeitado processado:", String(paymentInfo.id))
    } else {
      console.log("⚠️ Dados do carrinho não encontrados para:", extRef)
    }
  } catch (error) {
    console.error("❌ Erro ao processar pagamento rejeitado:", error)
  }
}

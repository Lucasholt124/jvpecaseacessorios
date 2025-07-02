import umami from "@umami/node"

// Inicializar Umami apenas se as variáveis estiverem configuradas
if (process.env.UMAMI_WEBSITE_ID && process.env.UMAMI_HOST_URL) {
  umami.init({
    websiteId: process.env.UMAMI_WEBSITE_ID,
    hostUrl: process.env.UMAMI_HOST_URL,
  })
}

// Função helper para verificar se Umami está configurado
const isUmamiConfigured = () => {
  return !!(process.env.UMAMI_WEBSITE_ID && process.env.UMAMI_HOST_URL)
}

// Rastrear sucesso do checkout
export const umamiTrackCheckoutSuccessEvent = async (payload: {
  orderId: string
  paymentId: string
  amount: number
  paymentMethod?: string
  timestamp: Date
}) => {
  if (!isUmamiConfigured()) {
    console.log("⚠️ Umami não configurado, pulando rastreamento")
    return
  }

  try {
    await umami.track("checkout_success", {
      order_id: payload.orderId,
      payment_id: payload.paymentId,
      amount: payload.amount,
      payment_method: payload.paymentMethod || "unknown",
      timestamp: payload.timestamp.toISOString(),
    })
    console.log("✅ Evento de checkout rastreado no Umami")
  } catch (error) {
    console.error("❌ Erro ao rastrear evento no Umami:", error)
  }
}

// Rastrear início do checkout
export const umamiTrackCheckoutStartEvent = async (payload: {
  cartValue: number
  itemCount: number
  timestamp: Date
}) => {
  if (!isUmamiConfigured()) return

  try {
    await umami.track("checkout_start", {
      cart_value: payload.cartValue,
      item_count: payload.itemCount,
      timestamp: payload.timestamp.toISOString(),
    })
    console.log("✅ Evento de início do checkout rastreado")
  } catch (error) {
    console.error("❌ Erro ao rastrear início do checkout:", error)
  }
}

// Rastrear abandono do carrinho
export const umamiTrackCartAbandonEvent = async (payload: {
  cartValue: number
  itemCount: number
  timestamp: Date
}) => {
  if (!isUmamiConfigured()) return

  try {
    await umami.track("cart_abandon", {
      cart_value: payload.cartValue,
      item_count: payload.itemCount,
      timestamp: payload.timestamp.toISOString(),
    })
    console.log("✅ Evento de abandono do carrinho rastreado")
  } catch (error) {
    console.error("❌ Erro ao rastrear abandono do carrinho:", error)
  }
}

// Rastrear visualização de produto
export const umamiTrackProductViewEvent = async (payload: {
  productId: string
  productName: string
  productPrice: number
  timestamp: Date
}) => {
  if (!isUmamiConfigured()) return

  try {
    await umami.track("product_view", {
      product_id: payload.productId,
      product_name: payload.productName,
      product_price: payload.productPrice,
      timestamp: payload.timestamp.toISOString(),
    })
    console.log("✅ Evento de visualização de produto rastreado")
  } catch (error) {
    console.error("❌ Erro ao rastrear visualização de produto:", error)
  }
}

// Rastrear adição ao carrinho
export const umamiTrackAddToCartEvent = async (payload: {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  timestamp: Date
}) => {
  if (!isUmamiConfigured()) return

  try {
    await umami.track("add_to_cart", {
      product_id: payload.productId,
      product_name: payload.productName,
      product_price: payload.productPrice,
      quantity: payload.quantity,
      timestamp: payload.timestamp.toISOString(),
    })
    console.log("✅ Evento de adição ao carrinho rastreado")
  } catch (error) {
    console.error("❌ Erro ao rastrear adição ao carrinho:", error)
  }
}

// Rastrear aplicação de cupom
export const umamiTrackCouponAppliedEvent = async (payload: {
  couponCode: string
  discountAmount: number
  orderValue: number
  timestamp: Date
}) => {
  if (!isUmamiConfigured()) return

  try {
    await umami.track("coupon_applied", {
      coupon_code: payload.couponCode,
      discount_amount: payload.discountAmount,
      order_value: payload.orderValue,
      timestamp: payload.timestamp.toISOString(),
    })
    console.log("✅ Evento de aplicação de cupom rastreado")
  } catch (error) {
    console.error("❌ Erro ao rastrear aplicação de cupom:", error)
  }
}

export default umami

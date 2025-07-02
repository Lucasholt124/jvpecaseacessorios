import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

// Verifica se a variável de ambiente essencial está presente
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN environment variable")
}

// Inicializa o cliente Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
})

// Exporta instâncias para uso em preferências e pagamentos
export { client }
export const preference = new Preference(client)
export const payment = new Payment(client)

/**
 * Retorna se o ambiente está em modo de teste (não produção)
 */
export const isTestMode = (): boolean => {
  return process.env.NODE_ENV !== "production"
}

/**
 * Retorna a URL de checkout (sandbox ou produção) com base no `preferenceId`
 */
export const getCheckoutUrl = (preferenceId: string): string => {
  const baseUrl = isTestMode()
    ? "https://sandbox.mercadopago.com.br/checkout/v1/redirect"
    : "https://www.mercadopago.com.br/checkout/v1/redirect"

  return `${baseUrl}?pref_id=${preferenceId}`
}

/**
 * Valida se os dados recebidos no webhook têm o formato esperado
 */
export const validateWebhookData = (data: any): boolean => {
  return !!(data && data.type && data.data?.id)
}

/**
 * Verifica se as credenciais do Mercado Pago estão configuradas
 * e retorna os valores encontrados.
 */
export const validateMercadoPagoCredentials = () => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY

  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado")
  }

  if (!publicKey) {
    console.warn("⚠️ MERCADOPAGO_PUBLIC_KEY não configurado (usado no frontend)")
  }

  return { accessToken, publicKey }
}

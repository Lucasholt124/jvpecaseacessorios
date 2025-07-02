"use server"

import { CartItem } from "./types"

// Sistema para armazenar dados do carrinho temporariamente
// Isso é necessário porque webhooks (ex: Mercado Pago ou Stripe) não têm acesso aos cookies do usuário

interface TempCartData {
  externalReference: string
  cart: CartItem[]
  customerData: Record<string, any>
  timestamp: number
}

// Substituir por Redis, PostgreSQL, etc. em produção
const tempCartStorage = new Map<string, TempCartData>()

// Armazena dados temporários do carrinho por 1 hora
export async function storeTempCartData(
  externalReference: string,
  cart: CartItem[],
  customerData: Record<string, any>
): Promise<void> {
  tempCartStorage.set(externalReference, {
    externalReference,
    cart,
    customerData,
    timestamp: Date.now(),
  })

  // Limpa dados antigos com mais de 1 hora (3600000 ms)
  const now = Date.now()
  for (const [key, value] of tempCartStorage.entries()) {
    if (now - value.timestamp > 3600000) {
      tempCartStorage.delete(key)
    }
  }
}

// Recupera os dados temporários do carrinho
export async function getTempCartData(externalReference: string): Promise<TempCartData | null> {
  return tempCartStorage.get(externalReference) || null
}

// Remove dados temporários associados a um externalReference
export async function clearTempCartData(externalReference: string): Promise<void> {
  tempCartStorage.delete(externalReference)
}

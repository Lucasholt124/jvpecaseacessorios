"use server"

import { prisma } from "@/lib/prisma"

interface ShippingCalculation {
  success: boolean
  options: ShippingOption[]
  error?: string
}

interface ShippingOption {
  id: string
  name: string
  price: number
  days: string
  description: string
  carrier: string
}

interface ShippingRate {
  service: string
  price: number
  days: number
  carrier: string
  weight: number
  zipCodeFrom: string
  zipCodeTo: string
  isActive?: boolean
}

export async function calculateRealShipping(
  cep: string,
  weight = 1,
  value = 0
): Promise<ShippingCalculation> {
  try {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) {
      return {
        success: false,
        options: [],
        error: "CEP inválido",
      }
    }

    const freeShipping = value >= 100

    const rates = await prisma.shippingRate.findMany({
      where: {
        isActive: true,
        weight: {
          gte: weight,
        },
        // Futuramente: filtros por CEPs
        // zipCodeFrom: { lte: cleanCep },
        // zipCodeTo: { gte: cleanCep },
      },
      orderBy: {
        price: "asc",
      },
    })

    if (rates.length === 0) {
      const basePrice = weight * 15
      const regionPrefix = cleanCep.substring(0, 2)
      const isNearby = ["01", "02", "03", "04", "05", "08", "09"].includes(regionPrefix)
      const multiplier = isNearby ? 1 : 1.5

      const options: ShippingOption[] = [
        {
          id: "pac",
          name: "PAC",
          price: freeShipping ? 0 : Math.round(basePrice * multiplier),
          days: isNearby ? "3-5 dias úteis" : "5-8 dias úteis",
          description: "Entrega econômica",
          carrier: "Correios",
        },
        {
          id: "sedex",
          name: "SEDEX",
          price: freeShipping ? 0 : Math.round(basePrice * 1.5 * multiplier),
          days: isNearby ? "1-2 dias úteis" : "2-4 dias úteis",
          description: "Entrega expressa",
          carrier: "Correios",
        },
      ]

      return { success: true, options }
    }

    const options: ShippingOption[] = rates.map((rate: ShippingRate) => ({
      id: rate.service.toLowerCase(),
      name: rate.service,
      price: freeShipping && rate.service.toLowerCase() === "pac" ? 0 : rate.price,
      days: `${rate.days} dias úteis`,
      description: rate.service.toLowerCase() === "pac" ? "Entrega econômica" : "Entrega expressa",
      carrier: rate.carrier,
    }))

    return { success: true, options }
  } catch (error) {
    console.error("Erro ao calcular frete:", error)
    return {
      success: false,
      options: [],
      error: "Erro interno ao calcular frete",
    }
  }
}

export async function saveShippingRates() {
  try {
    await prisma.shippingRate.deleteMany()

    const rates: ShippingRate[] = [
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 0.5, price: 15, days: 5, carrier: "Correios", service: "PAC", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 1, price: 20, days: 5, carrier: "Correios", service: "PAC", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 2, price: 30, days: 5, carrier: "Correios", service: "PAC", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 5, price: 50, days: 5, carrier: "Correios", service: "PAC", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 0.5, price: 25, days: 2, carrier: "Correios", service: "SEDEX", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 1, price: 35, days: 2, carrier: "Correios", service: "SEDEX", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 2, price: 50, days: 2, carrier: "Correios", service: "SEDEX", isActive: true },
      { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 5, price: 80, days: 2, carrier: "Correios", service: "SEDEX", isActive: true },
    ]

    await prisma.shippingRate.createMany({ data: rates })

    console.log("✅ Tarifas de frete salvas com sucesso")
    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao salvar tarifas:", error)
    return { success: false, error: "Erro ao salvar tarifas" }
  }
}

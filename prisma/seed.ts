import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // Obter senha do admin via .env ou usar fallback apenas em dev
  const adminPasswordPlain = process.env.ADMIN_PASSWORD ?? "admin123"

  if (!adminPasswordPlain) {
    throw new Error("❌ A senha do administrador (ADMIN_PASSWORD) não está definida.")
  }

  const adminPassword = await bcrypt.hash(adminPasswordPlain, 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@jvpecas.com" },
    update: {},
    create: {
      email: "admin@jvpecas.com",
      name: "Administrador",
      password: adminPassword,
      role: "admin",
      phone: "11999999999",
    },
  })

  console.log("✅ Usuário admin criado:", admin.email)

  // Criar tarifas de frete
  await prisma.shippingRate.deleteMany()

  const shippingRates = [
    // PAC
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 0.5, price: 15, days: 5, carrier: "Correios", service: "PAC" },
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 1, price: 20, days: 5, carrier: "Correios", service: "PAC" },
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 2, price: 30, days: 5, carrier: "Correios", service: "PAC" },
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 5, price: 50, days: 5, carrier: "Correios", service: "PAC" },

    // SEDEX
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 0.5, price: 25, days: 2, carrier: "Correios", service: "SEDEX" },
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 1, price: 35, days: 2, carrier: "Correios", service: "SEDEX" },
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 2, price: 50, days: 2, carrier: "Correios", service: "SEDEX" },
    { zipCodeFrom: "00000000", zipCodeTo: "99999999", weight: 5, price: 80, days: 2, carrier: "Correios", service: "SEDEX" },
  ]

  await prisma.shippingRate.createMany({ data: shippingRates })
  console.log("✅ Tarifas de frete criadas")

  // Criar cupons
  const coupons = [
    {
      code: "BEMVINDO10",
      type: "PERCENTAGE" as const,
      value: 10,
      minValue: 50,
      maxUses: 100,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    },
    {
      code: "FRETE20",
      type: "FIXED" as const,
      value: 20,
      minValue: 100,
      maxUses: 50,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
    },
  ]

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    })
  }

  console.log("✅ Cupons criados")
  console.log("🎉 Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

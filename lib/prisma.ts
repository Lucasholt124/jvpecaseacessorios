import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log("✅ Conectado ao banco de dados")
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error)
    throw error
  }
}

export async function disconnectFromDatabase() {
  try {
    await prisma.$disconnect()
    console.log("✅ Desconectado do banco de dados")
  } catch (error) {
    console.error("❌ Erro ao desconectar do banco:", error)
  }
}

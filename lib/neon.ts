import { neon } from "@neondatabase/serverless"

// Verificação de variável de ambiente
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL não está definida no ambiente")
}

// Exporta instância do client SQL
export const sql = neon(process.env.DATABASE_URL)

/**
 * Função para testar a conexão com o banco de dados Neon
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW()`
    console.log("✅ Conexão com Neon estabelecida:", result[0])
    return true
  } catch (error) {
    console.error("❌ Erro ao conectar com Neon:", error)
    return false
  }
}

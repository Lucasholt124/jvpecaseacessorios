import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Atualiza usuário no banco
    await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
    })

    return NextResponse.json({ message: "Perfil atualizado" })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

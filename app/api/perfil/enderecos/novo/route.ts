import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const { street, number, city, state, zipCode } = body

    if (!street || !number || !city || !state || !zipCode) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    await prisma.address.create({
      data: {
        userId: user.id,
        street,
        number,
        city,
        state,
        zipCode,
        name: "Endereço Padrão", // ou peça nome no form
        neighborhood: "", // opcional
        isDefault: false,
      },
    })

    return NextResponse.json({ message: "Endereço adicionado" })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { name, email, phone, subject, message } = data

    // Validação simples
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      )
    }

    // Salva no banco
    await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    })

    return NextResponse.json({ message: "Contato enviado com sucesso!" })
  } catch (error) {
    console.error("Erro ao salvar contato:", error)
    return NextResponse.json(
      { error: "Erro interno ao enviar contato." },
      { status: 500 }
    )
  }
}

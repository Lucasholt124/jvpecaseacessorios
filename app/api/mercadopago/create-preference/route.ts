import { type NextRequest, NextResponse } from "next/server"
import { createMercadoPagoPreference } from "@/lib/mercadopago-actions-real"
import { getCart } from "@/lib/cart-actions"  // Import direto para evitar fetch

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📦 Dados recebidos:", body)

    const { email, name, phone, address } = body

    // Validação dos dados
    if (!email) return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    if (!phone?.area_code || !phone?.number)
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    if (
      !address?.zip_code ||
      !address?.street_name ||
      !address?.street_number ||
      !address?.city ||
      !address?.state
    ) {
      return NextResponse.json({ error: "Endereço completo é obrigatório" }, { status: 400 })
    }

    // Sanitização e preparo dos dados
    const customerData = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      phone: {
        area_code: phone.area_code.replace(/\D/g, ""),
        number: phone.number.replace(/\D/g, ""),
      },
      address: {
        zip_code: address.zip_code.replace(/\D/g, ""),
        street_name: address.street_name.trim(),
        street_number: String(address.street_number).trim(),
        neighborhood: address.neighborhood?.trim() || "",
        city: address.city.trim(),
        state: address.state.trim(),
        complement: address.complement?.trim() || "",
      },
    }

    console.log("✅ Dados para preferência:", customerData)

    // Busca o carrinho diretamente da função backend, sem fetch
    const cart = await getCart()

    if (!cart || cart.length === 0) {
      throw new Error("Carrinho vazio")
    }

    // Cria a preferência no Mercado Pago
    const preference = await createMercadoPagoPreference(customerData, cart)

    if (!preference) {
      return NextResponse.json({ error: "Falha ao criar preferência" }, { status: 500 })
    }

    return NextResponse.json(preference)
  } catch (error) {
    console.error("❌ Erro ao criar preferência do Mercado Pago:", error)
    return NextResponse.json(
      { error: "Falha ao processar pagamento" },
      { status: 500 }
    )
  }
}

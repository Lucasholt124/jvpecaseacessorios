import { type NextRequest, NextResponse } from "next/server"
import { createMercadoPagoPreference } from "@/lib/mercadopago-actions-real"
import { getCart } from "@/lib/cart-actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, name, phone, address } = body

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

    // 🧠 Aqui está a correção: sem fetch, acessa cookie via server
    const cart = await getCart()

    if (!cart || cart.length === 0) {
      console.error("❌ Carrinho vazio (cookie não encontrado ou expirado)")
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    const preference = await createMercadoPagoPreference(customerData, cart)

    return NextResponse.json(preference)
  } catch (error) {
    console.error("❌ Erro ao criar preferência do Mercado Pago:", error)
    return NextResponse.json(
      { error: "Falha ao processar pagamento" },
      { status: 500 }
    )
  }
}

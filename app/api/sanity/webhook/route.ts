import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

const WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()

    // Verificar assinatura do webhook se configurada
    if (WEBHOOK_SECRET) {
      const signature = request.headers.get("sanity-webhook-signature")
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 })
      }

      const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const data = JSON.parse(body)

    console.log("📡 Webhook do Sanity recebido:", data)

    // Revalidar conteúdo baseado no tipo de documento
    const documentType = data._type

    switch (documentType) {
      case "product":
        console.log("🔄 Revalidando produtos...")
        revalidatePath("/")
        revalidatePath("/produtos")
        if (data.slug?.current) {
          revalidatePath(`/produto/${data.slug.current}`)
        }
        break

      case "category":
        console.log("🔄 Revalidando categorias...")
        revalidatePath("/")
        revalidatePath("/produtos")
        revalidatePath("/categorias")
        break

      case "banner":
        console.log("🔄 Revalidando banners...")
        revalidatePath("/")
        break

      default:
        console.log("🔄 Revalidando tudo...")
        revalidatePath("/", "layout")
        break
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      type: documentType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erro no webhook do Sanity:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

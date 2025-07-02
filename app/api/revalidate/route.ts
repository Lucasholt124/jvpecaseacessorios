import { revalidatePath, revalidateTag } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, slug } = body

    // Revalidar baseado no tipo de conteúdo
    switch (type) {
      case "product":
        revalidateTag("products")
        revalidatePath("/produtos")
        revalidatePath("/")
        if (slug) {
          revalidatePath(`/produto/${slug}`)
        }
        break

      case "category":
        revalidateTag("categories")
        revalidatePath("/categorias")
        revalidatePath("/produtos")
        revalidatePath("/")
        break

      case "banner":
        revalidateTag("banners")
        revalidatePath("/")
        break

      default:
        // Revalidar tudo
        revalidatePath("/", "layout")
        break
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type,
    })
  } catch (error) {
    console.error("Erro na revalidação:", error)
    return NextResponse.json({ error: "Erro ao revalidar" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addToWishlist, removeFromWishlist } from "@/lib/wishlist";

interface WishlistRequestBody {
  productId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body: WishlistRequestBody = await req.json();
    if (!body.productId)
      return NextResponse.json({ error: "Produto não informado" }, { status: 400 });

    const result = await addToWishlist(user.id, body.productId);
    if (result.success) return NextResponse.json({ success: true });

    return NextResponse.json(
      { error: result.error || "Erro ao adicionar aos favoritos" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Erro no POST /api/wishlist:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body: WishlistRequestBody = await req.json();
    if (!body.productId)
      return NextResponse.json({ error: "Produto não informado" }, { status: 400 });

    const result = await removeFromWishlist(user.id, body.productId);
    if (result.success) return NextResponse.json({ success: true });

    return NextResponse.json(
      { error: result.error || "Erro ao remover dos favoritos" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Erro no DELETE /api/wishlist:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

/**
 * Adiciona um produto aos favoritos do usuário, se ainda não estiver.
 */
export async function addToWishlist(userId: string, productId: string) {
  try {
    // Verifica se já está na wishlist
    const alreadyInWishlist = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (alreadyInWishlist) {
      return { success: true };
    }

    // Cria novo favorito
    await prisma.wishlistItem.create({
      data: { userId, productId },
    });

    // Revalida a página favoritos
    revalidatePath("/favoritos");

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao adicionar aos favoritos:", error.message ?? error);
    return { success: false, error: "Erro ao adicionar aos favoritos" };
  }
}

/**
 * Remove um produto dos favoritos do usuário.
 */
export async function removeFromWishlist(userId: string, productId: string) {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId, productId },
    });

    revalidatePath("/favoritos");

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao remover dos favoritos:", error.message ?? error);
    return { success: false, error: "Erro ao remover dos favoritos" };
  }
}

/**
 * Retorna os IDs dos produtos favoritos de um usuário.
 */
export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const favorites = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { productId: true },
    });

    return favorites.map((item) => item.productId);
  } catch (error: any) {
    console.error("Erro ao buscar favoritos:", error.message ?? error);
    return [];
  }
}

/**
 * Verifica se um produto está na wishlist do usuário.
 */
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return Boolean(item);
  } catch (error: any) {
    console.error("Erro ao verificar item na wishlist:", error.message ?? error);
    return false;
  }
}

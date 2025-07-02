"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

// Função para converter uma review Prisma para objeto plano serializável
function serializeReview(review: any) {
  return {
    ...review,
    createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
    updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt,
    user: review.user ? {
      ...review.user,
      // se user tiver datas ou campos especiais, trate aqui também
    } : null,
  };
}

export async function getProductReviews(productId: string) {
  try {
    if (!productId) return [];

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Converte cada review para objeto plano serializável
    return reviews.map(serializeReview);
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return [];
  }
}

export async function getProductRating(productId: string) {
  if (!productId) {
    return { averageRating: 0, totalReviews: 0 };
  }

  try {
    const result = await prisma.review.aggregate({
      where: {
        productId,
        isActive: true,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Converte Decimal para número simples
    const averageRating = result._avg.rating ? Number(result._avg.rating) : 0;
    const totalReviews = result._count.rating ?? 0;

    // Retorna objeto plano e serializável
    return {
      averageRating,
      totalReviews,
    };
  } catch (error) {
    console.error("Erro ao obter rating:", error);
    return {
      averageRating: 0,
      totalReviews: 0,
    };
  }
}

export async function createReview(data: {
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
}) {
  try {
    // Validações
    if (!data.productId || !data.userId || !data.rating) {
      return { success: false, error: "Dados obrigatórios não fornecidos" };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: "Avaliação deve ser entre 1 e 5 estrelas" };
    }

    // Verificar se o usuário já avaliou este produto
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: data.productId,
          userId: data.userId,
        },
      },
    });

    if (existingReview) {
      return { success: false, error: "Você já avaliou este produto" };
    }

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment?.trim() || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/produto/${data.productId}`);

    return { success: true, review: serializeReview(review) };
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return { success: false, error: "Erro ao criar avaliação" };
  }
}

export async function updateReview(
  reviewId: string,
  data: {
    rating: number;
    comment?: string;
  },
) {
  try {
    if (!reviewId || !data.rating) {
      return { success: false, error: "Dados obrigatórios não fornecidos" };
    }

    if (data.rating < 1 || data.rating > 5) {
      return { success: false, error: "Avaliação deve ser entre 1 e 5 estrelas" };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment?.trim() || null,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/produto`);

    return { success: true, review: serializeReview(review) };
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    return { success: false, error: "Erro ao atualizar avaliação" };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    if (!reviewId) {
      return { success: false, error: "ID da avaliação é obrigatório" };
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { isActive: false },
    });

    revalidatePath(`/produto`);

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    return { success: false, error: "Erro ao deletar avaliação" };
  }
}

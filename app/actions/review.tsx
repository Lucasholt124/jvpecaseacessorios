'use server'

import { createReview } from "@/lib/reviews"

export async function createReviewAction(data: {
  productId: string
  userId: string
  rating: number
  comment?: string
}) {
  return await createReview(data)
}

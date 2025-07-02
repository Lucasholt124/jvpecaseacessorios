"use client"

import { useState, useEffect } from "react"
import { Star, MessageCircle, Pencil, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { getProductReviews, getProductRating, createReview, updateReview, deleteReview } from "@/lib/reviews"
import { toast } from "react-hot-toast"

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

interface ProductReviewsProps {
  productId: string
  userId?: string
  userEmail?: string
}

export default function ProductReviews({ productId, userId, userEmail }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 })
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
console.log("userId recebido em ProductReviews:", userId)
  useEffect(() => {
    console.log("Carregando avaliações para produto:", productId)
    loadReviews()
    loadRating()
  }, [productId])

  async function loadReviews() {
    try {
      const reviewsData = await getProductReviews(productId)
      console.log("Avaliações carregadas:", reviewsData)
      setReviews(
        reviewsData.map((review: any) => ({
          ...review,
          createdAt: typeof review.createdAt === "string" ? review.createdAt : review.createdAt.toISOString(),
        }))
      )
    } catch (e) {
      console.error(e)
      toast.error("Erro ao carregar avaliações.")
    }
  }

  async function loadRating() {
    try {
      const ratingData = await getProductRating(productId)
      console.log("Avaliação média:", ratingData)
      setRating(ratingData)
    } catch (e) {
      console.error(e)
      toast.error("Erro ao carregar avaliação média.")
    }
  }

  async function handleSubmitReview() {
    if (!userId) {
      toast.error("Você precisa estar logado para enviar avaliação.")
      return
    }
    if (newRating === 0) {
      toast.error("Você precisa dar uma nota para enviar a avaliação.")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingReviewId) {
        const result = await updateReview(editingReviewId, {
          rating: newRating,
          comment: newComment.trim() || undefined,
        })

        if (result.success) {
          toast.success("Avaliação atualizada com sucesso!")
        } else {
          toast.error(result.error || "Erro ao atualizar avaliação.")
        }
      } else {
        const result = await createReview({
          productId,
          userId,
          rating: newRating,
          comment: newComment.trim() || undefined,
        })

        if (result.success) {
          toast.success("Avaliação enviada com sucesso!")
        } else {
          toast.error(result.error || "Erro ao enviar avaliação.")
        }
      }

      resetForm()
      await loadReviews()
      await loadRating()
    } catch (e) {
      console.error(e)
      toast.error("Erro ao enviar avaliação, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setNewRating(0)
    setNewComment("")
    setShowReviewForm(false)
    setEditingReviewId(null)
  }

  async function handleDeleteReview(id: string) {
    const confirm = window.confirm("Deseja realmente excluir sua avaliação?")
    if (!confirm) return

    try {
      const result = await deleteReview(id)
      if (result.success) {
        toast.success("Avaliação removida.")
        await loadReviews()
        await loadRating()
      } else {
        toast.error(result.error || "Erro ao deletar avaliação.")
      }
    } catch (e) {
      console.error(e)
      toast.error("Erro ao deletar avaliação.")
    }
  }

  function handleEditReview(review: Review) {
    setEditingReviewId(review.id)
    setNewRating(review.rating)
    setNewComment(review.comment || "")
    setShowReviewForm(true)
  }

  const renderStars = (ratingValue: number, interactive = false, onRate?: (rating: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          aria-pressed={star === ratingValue}
        >
          <Star className={`w-5 h-5 ${star <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Avaliações dos Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(rating.averageRating))}
              <span className="text-2xl font-bold">{rating.averageRating.toFixed(1)}</span>
            </div>
            <Badge variant="secondary">
              {rating.totalReviews} {rating.totalReviews === 1 ? "avaliação" : "avaliações"}
            </Badge>
          </div>

          {!userId && (
            <p className="mb-4 text-sm text-gray-600">Faça login para escrever uma avaliação.</p>
          )}

          {userId && (
            <div className="space-y-4">
              {!showReviewForm ? (
                <Button onClick={() => setShowReviewForm(true)}>Escrever Avaliação</Button>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{editingReviewId ? "Editar" : "Sua"} Avaliação</label>
                    <button onClick={resetForm}>
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-800" />
                    </button>
                  </div>

                  {renderStars(newRating, true, setNewRating)}

                  <div>
                    <label className="block text-sm font-medium mb-2">Comentário (opcional)</label>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Conte sobre sua experiência com este produto..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmitReview} disabled={newRating === 0 || isSubmitting}>
                      {isSubmitting ? "Enviando..." : editingReviewId ? "Atualizar" : "Enviar"}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Avaliações */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Todas as Avaliações</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="font-medium">{review.user.name || "Cliente"}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {userEmail && review.user.email === userEmail && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditReview(review)} title="Editar">
                        <Pencil className="w-4 h-4 text-gray-600 hover:text-black" />
                      </button>
                      <button onClick={() => handleDeleteReview(review.id)} title="Excluir">
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </button>
                    </div>
                  )}
                </div>
                {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Seja o primeiro a avaliar este produto!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

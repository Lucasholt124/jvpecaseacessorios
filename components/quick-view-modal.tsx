"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Share2, Check, Loader2 } from "lucide-react"
import Zoom from "react-medium-image-zoom"
import { urlFor } from "@/lib/sanity"
import { formatPrice } from "@/lib/utils"
import { toast } from "react-hot-toast"

interface QuickViewModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: any) => void
}

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  if (!product) return null

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  useEffect(() => {
    const stored = localStorage.getItem("favorites")
    if (stored) setFavorites(JSON.parse(stored))
  }, [])

  const toggleFavorite = () => {
    let updated: string[]
    if (favorites.includes(product._id)) {
      updated = favorites.filter((id) => id !== product._id)
      toast.success("Removido dos favoritos")
    } else {
      updated = [...favorites, product._id]
      toast.success("Adicionado aos favoritos")
    }
    setFavorites(updated)
    localStorage.setItem("favorites", JSON.stringify(updated))
  }

  const isFavorite = favorites.includes(product._id)

  const handleAddToCart = async () => {
    if (product.stock === 0 || loading) return
    setLoading(true)
    try {
      onAddToCart({ ...product, quantity })
      setAdded(true)
      toast.success("Produto adicionado ao carrinho!")
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      toast.error("Erro ao adicionar ao carrinho")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const shareData = {
      title: product.name,
      text: `Confira este produto: ${product.name}`,
      url: window.location.origin + `/produto/${product.slug.current}`,
    }

    if (navigator.share) {
      navigator.share(shareData).catch(() => toast.error("Erro ao compartilhar"))
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => toast.success("URL copiada para a área de transferência"))
        .catch(() => toast.error("Erro ao copiar URL"))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="sr-only">Visualização Rápida - {product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {product.images?.[selectedImage] ? (
                <Zoom zoomMargin={40}>
                  <Image
                    src={urlFor(product.images[selectedImage])?.width(600).height(600).url() || "/placeholder.svg"}
                    alt={`${product.name} imagem ${selectedImage + 1}`}
                    width={600}
                    height={600}
                    className="object-cover rounded-lg"
                    priority
                  />
                </Zoom>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                  <span className="text-gray-400">Sem imagem</span>
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {product.images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === index ? "border-blue-600" : "border-gray-300"
                    }`}
                    aria-label={`Selecionar imagem ${index + 1}`}
                    type="button"
                  >
                    <Image
                      src={urlFor(image)?.width(80).height(80).url() || "/placeholder.svg"}
                      alt={`${product.name} miniatura ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover"
                      priority={index === selectedImage}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <Badge variant="secondary" className="mb-3 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                {product.category}
              </Badge>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{product.name}</h2>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center space-x-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">(4.8) 124 avaliações</span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-5">
                  <span className="text-4xl font-extrabold text-primary">{formatPrice(product.price)}</span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                  )}
                </div>
                <p className="text-sm text-green-600 font-medium">12x de {formatPrice(product.price / 12)} sem juros</p>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-lg">Descrição</h3>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{product.description}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-gray-700 font-medium">Estoque:</span>
                {product.stock > 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                    {product.stock} disponíveis
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-3 py-1 rounded-full font-semibold">
                    Esgotado
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label htmlFor="quantity" className="text-sm font-medium">Quantidade:</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                    aria-label="Diminuir quantidade"
                    type="button"
                  >–</button>
                  <span id="quantity" className="px-6 py-2 border-x select-none" aria-live="polite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity >= product.stock}
                    aria-label="Aumentar quantidade"
                    type="button"
                  >+</button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4">
                <Button
                  className={`flex-1 text-white font-semibold flex items-center justify-center gap-2 transition-all active:scale-95
                    ${added ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || loading}
                  aria-label={product.stock === 0 ? "Produto esgotado" : "Adicionar ao carrinho"}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : added ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {loading ? "Adicionando..." : added ? "Adicionado!" : "Adicionar ao Carrinho"}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFavorite}
                  aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  className={`text-gray-700 hover:text-red-600 transition-colors ${isFavorite ? "text-red-600" : ""}`}
                >
                  <Heart className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  aria-label="Compartilhar produto"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button variant="secondary" className="w-full" size="lg" onClick={() => alert("Comprar Agora funcionalidade ainda não implementada")}>Comprar Agora</Button>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mt-6">
              <div className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span><span>Frete grátis acima de R$ 100</span></div>
              <div className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span><span>Garantia de 30 dias</span></div>
              <div className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span><span>Pagamento seguro</span></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

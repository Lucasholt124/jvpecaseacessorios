"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Star, Eye, Heart } from "lucide-react"
import { getImageUrl } from "@/lib/sanity"
import { formatPrice } from "@/lib/utils"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "react-hot-toast"
import { create } from "zustand"

// --- WISHLIST STORE ---

interface WishlistItem {
  id: string
  name: string
  slug: string
  image: string
}

interface WishlistState {
  items: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
}

const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addToWishlist: (item) => {
    if (!get().isInWishlist(item.id)) {
      set((state) => ({ items: [...state.items, item] }))
      toast.success("Adicionado aos favoritos")
    }
  },
  removeFromWishlist: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
    toast.success("Removido dos favoritos")
  },
  isInWishlist: (id) => get().items.some((item) => item.id === id),
}))

// --- QUICK VIEW MODAL ---

interface ImageType {
  _type: string
  asset: { _ref: string }
  alt?: string
}

interface Product {
  _id: string
  name: string
  slug: { current: string }
  price: number
  compareAtPrice?: number
  images: ImageType[]
  stock: number
  category: string
}

interface QuickViewModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product) => void
}

function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  if (!isOpen) return null

  const productImage = getImageUrl(product.images?.[0], 400, 400) || "/placeholder.png"

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg max-w-3xl w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
          aria-label="Fechar visualização rápida"
        >
          &times;
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-1/2 aspect-square rounded-lg overflow-hidden">
            <Image
              src={productImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex flex-col justify-between w-full md:w-1/2">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-4">Categoria: {product.category}</p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-extrabold text-green-600">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              {product.stock === 0 ? (
                <p className="text-red-600 font-semibold mb-4">Produto esgotado</p>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  {product.stock} unidade{product.stock > 1 ? "s" : ""} em estoque
                </p>
              )}
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={product.stock === 0}
              onClick={() => {
                onAddToCart(product)
                onClose()
              }}
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- PRODUCT CARD ---

interface ProductCardProps {
  product: Product
  rating?: { averageRating: number; totalReviews: number }
}

export default function ProductCard({ product, rating }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [loading, setLoading] = useState(false)
  const [isQuickViewOpen, setQuickViewOpen] = useState(false)

  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price

  const discountPercent = hasDiscount && product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  // WISHLIST STORE
  const addToWishlist = useWishlistStore((state) => state.addToWishlist)
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist)

  const isFavorite = isInWishlist(product._id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) {
      toast.error("Produto fora de estoque")
      return
    }

    if (loading) return

    setLoading(true)
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.images?.[0], 100, 100),
      slug: product.slug.current,
      stock: product.stock,
    })
    toast.success("Produto adicionado ao carrinho!")
    setLoading(false)
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isFavorite) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist({
        id: product._id,
        name: product.name,
        slug: product.slug.current,
        image: getImageUrl(product.images?.[0], 100, 100),
      })
    }
  }

  const productImage = getImageUrl(product.images?.[0], 400, 400) || "/placeholder.png"

  return (
    <>
      <Card className="group hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-t-xl">
            <Link href={`/produto/${product.slug.current}`}>
              <Image
                src={productImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {hasDiscount && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                  -{discountPercent}%
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="destructive" className="font-bold">
                  Esgotado
                </Badge>
              )}
            </div>

            {/* Floating actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white rounded-full shadow"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setQuickViewOpen(true)
                }}
                aria-label="Visualização rápida"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className={`w-10 h-10 p-0 rounded-full shadow bg-white/90 hover:bg-white ${
                  isFavorite ? "text-red-600" : ""
                }`}
                onClick={toggleWishlist}
                aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </Button>
            </div>
          </div>

          {/* Product info */}
          <div className="p-4 space-y-3">
            <div>
              <Badge variant="secondary" className="text-xs mb-2 bg-blue-50 text-blue-700">
                {product.category}
              </Badge>
              <Link href={`/produto/${product.slug.current}`}>
                <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {product.name}
                </h3>
              </Link>
            </div>

            {/* Rating */}
            {rating && rating.totalReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium ml-1">{rating.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-500">({rating.totalReviews})</span>
              </div>
            )}

            {/* Price and button */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-green-600">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={product.stock === 0 || loading}
                  onClick={handleAddToCart}
                  aria-label={product.stock === 0 ? "Produto esgotado" : "Adicionar ao carrinho"}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {loading ? "Carregando..." : product.stock === 0 ? "Esgotado" : "Adicionar"}
                </Button>
              </div>

              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-xs text-orange-600 font-medium">
                  Apenas {product.stock} restantes!
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick view modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={(prod) => {
          addItem({
            id: prod._id,
            name: prod.name,
            price: prod.price,
            image: getImageUrl(prod.images?.[0], 100, 100),
            slug: prod.slug.current,
            stock: prod.stock,
          })
          toast.success("Produto adicionado ao carrinho!")
          setQuickViewOpen(false)
        }}
      />
    </>
  )
}

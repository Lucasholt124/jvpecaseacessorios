"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "react-hot-toast"
import { getImageUrl } from "@/lib/sanity"
import ProductActions from "@/components/ProductActions"
import ProductCarousel from "@/components/product-carousel"
import ProductCard from "@/components/product-card"
import ProductReviews from "@/components/product-reviews"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2, Truck, Shield, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice, getShippingMessage } from "@/lib/utils"

interface ProductClientProps {
  product: any
  rating: { averageRating: number; totalReviews: number }
  isFavorited: boolean
  recommendedProducts: any[]
  userId?: string
  userEmail?: string
}

function AddToCartButton({
  onAdd,
  disabled,
}: {
  onAdd: () => Promise<void> | void
  disabled: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  async function handleClick() {
    if (disabled) return
    setLoading(true)
    try {
      await onAdd()
      setAdded(true)
      toast.success("Produto adicionado ao carrinho!")
      setTimeout(() => setAdded(false), 2000)
    } catch {
      toast.error("Erro ao adicionar ao carrinho.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      className={`w-full flex items-center justify-center gap-2 font-semibold transition-all
        ${added ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-label={disabled ? "Produto esgotado" : "Adicionar ao carrinho"}
      aria-live="polite"
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      ) : (
        <ShoppingCart className="w-5 h-5" aria-hidden="true" />
      )}
      {added ? "Adicionado!" : disabled ? "Esgotado" : "Adicionar ao carrinho"}
    </Button>
  )
}

export default function ProductClient({
  product,
  rating,
  isFavorited,
  recommendedProducts,
  userId,
  userEmail,
}: ProductClientProps) {
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)

  const parcelaMensal = (valor: number, parcelas = 12, juros = 0.015) => {
    const m = juros
    const n = parcelas
    return (valor * m) / (1 - Math.pow(1 + m, -n))
  }

  const parcela = parcelaMensal(product.price)

  const handleAddToCart = async () => {
    if (!product.stock || product.stock === 0) {
      toast.error("Produto fora de estoque")
      return
    }

    const alreadyInCart = cartItems.some((item) => item.id === product._id)
    if (alreadyInCart) {
      toast("Este produto já está no seu carrinho.", { icon: "🛒" })
      return
    }

    await addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.images?.[0], 100, 100),
      slug: product.slug.current,
      stock: product.stock,
    })
  }

  const hasDiscount =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price

  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const shippingMessage = getShippingMessage(product.price)

  return (
    <div className="container mx-auto px-4 py-8 bg-white text-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div>
          <ProductCarousel
            images={product.images ?? []}
            video={product.video ?? null}
            productName={product.name}
          />
        </div>

        <div className="space-y-6">
          {product.category && (
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          {rating.totalReviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className={`text-lg ${
                      s <= Math.round(rating.averageRating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {rating.averageRating.toFixed(1)} ({rating.totalReviews} avaliações)
              </span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <Badge className="bg-red-500">-{discountPercent}%</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">{shippingMessage}</p>
            <p className="text-sm text-gray-700">
              ou em 12x de {formatPrice(parcela)} com juros de 1.5% ao mês
            </p>
          </div>

          {product.description && (
            <>
              <h3 className="font-semibold">Descrição</h3>
              <p className="text-gray-700">{product.description}</p>
            </>
          )}

          {product.specifications?.map((spec: any, i: number) => (
            <div key={i} className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600">{spec.name}:</span>
              <span className="font-medium">{spec.value}</span>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Estoque:</span>
            {product.stock && product.stock > 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {product.stock} disponíveis
              </Badge>
            ) : (
              <Badge variant="destructive">Esgotado</Badge>
            )}
          </div>

          <ProductActions
            productId={product._id}
            productName={product.name}
            productPrice={product.price}
            productImage={product.images?.[0]?.asset?.url || ""}
            productInStock={!!product.stock && product.stock > 0}
            isFavorited={isFavorited}
          />

          <AddToCartButton onAdd={handleAddToCart} disabled={!product.stock || product.stock === 0} />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Frete Grátis</p>
                  <p className="text-sm text-gray-600">Para pedidos acima de R$ 100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Compra Protegida</p>
                  <p className="text-sm text-gray-600">Pagamento 100% seguro</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Troca Garantida</p>
                  <p className="text-sm text-gray-600">7 dias para trocar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      <ProductReviews productId={product._id} userId={userId} userEmail={userEmail} />

      {recommendedProducts.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-12 mb-6">Produtos Recomendados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendedProducts.slice(0, 4).map((p) => (
              <ProductCard
                key={p._id}
                product={{
                  ...p,
                  compareAtPrice: p.compareAtPrice === null ? undefined : p.compareAtPrice,
                  images: (p.images ?? []).map((img: any) => ({
                    _type: "image",
                    asset: { _ref: img.asset._id },
                    alt: img.alt ?? undefined,
                  })),
                  stock: p.stock ?? 0,
                  category: p.category ?? "",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

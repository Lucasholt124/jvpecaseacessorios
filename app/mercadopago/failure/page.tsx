import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProductCarousel from "@/components/product-carousel"
import ProductReviews from "@/components/product-reviews"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { getProduct } from "@/lib/sanity"
import { getProductRating } from "@/lib/reviews"
import { formatPrice, getShippingMessage, calculateShipping } from "@/lib/utils"

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: "Produto não encontrado",
    }
  }

  return {
    title: product.seo?.title || product.name,
    description: product.seo?.description || product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const rating = await getProductRating(product._id)
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const shipping = calculateShipping(product.price)
  const shippingMessage = getShippingMessage(product.price)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Galeria de Imagens */}
        <div>
          <ProductCarousel images={product.images} video={product.video} productName={product.name} />
        </div>

        {/* Informações do Produto */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {rating.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(rating.averageRating) ? "text-yellow-400" : "text-gray-300"
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
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                  <Badge className="bg-red-500">-{discountPercent}%</Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">{shippingMessage}</p>
          </div>

          {/* Descrição */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Especificações */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Especificações</h3>
              <div className="space-y-2">
                {product.specifications.map((spec: any, index: number) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">{spec.name}:</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estoque */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Estoque:</span>
            {product.stock > 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {product.stock} disponíveis
              </Badge>
            ) : (
              <Badge variant="destructive">Esgotado</Badge>
            )}
          </div>

          {/* Ações */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button size="lg" className="flex-1" disabled={product.stock === 0}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="secondary" size="lg" className="w-full">
              Comprar Agora
            </Button>
          </div>

          {/* Garantias */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      {/* Avaliações */}
      <ProductReviews productId={product._id} />
    </div>
  )
}

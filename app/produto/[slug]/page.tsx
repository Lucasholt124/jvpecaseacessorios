// app/produto/[slug]/page.tsx
import { getProduct, getProducts } from "@/lib/sanity"
import { getProductRating } from "@/lib/reviews"
import { getCurrentUser } from "@/lib/auth"
import { isInWishlist } from "@/lib/wishlist"
import ProductClient from "@/components/product-client"
import type { Metadata } from "next"
import { Product } from "@/lib/types"

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: "Produto não encontrado" }
  return {
    title: product.seo?.title || product.name,
    description: product.seo?.description || product.description || "",
  }
}

function getRecommendedProducts(products: Product[], currentProduct: Product): Product[] {
  const price = currentProduct.price
  const maxRecommendations = 4
  const cheapThreshold = 100

  let recommended: Product[] = []

  if (price <= cheapThreshold) {
    // Produtos com preço maior que o atual, até 3x o preço
    recommended = products
      .filter(p => p._id !== currentProduct._id)
      .filter(p => p.price > price && p.price <= price * 3)
      .sort((a, b) => a.price - b.price)
      .slice(0, maxRecommendations)
  } else {
    // Produtos dentro de ±20% do preço
    recommended = products
      .filter(p => p._id !== currentProduct._id)
      .filter(p => p.price >= price * 0.8 && p.price <= price * 1.2)
      .sort((a, b) => a.price - b.price)
      .slice(0, maxRecommendations)
  }

  // Fallback: se não achou nenhum produto no filtro, pega os primeiros diferentes do atual
  if (recommended.length === 0) {
    recommended = products
      .filter(p => p._id !== currentProduct._id)
      .slice(0, maxRecommendations)
  }

  return recommended
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  if (!product) return null

  const user = await getCurrentUser()
  const rating = await getProductRating(product._id)
  const isFavorited = user ? await isInWishlist(user.id, product._id) : false

  const products = await getProducts()

  const recommendedProducts = getRecommendedProducts(products, product)

  return (
    <ProductClient
      product={product}
      rating={rating}
      isFavorited={isFavorited}
      recommendedProducts={recommendedProducts}
      userId={user?.id}
      userEmail={user?.email}
    />
  )
}

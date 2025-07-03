"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/lib/sanity"
import { getProductRating } from "@/lib/reviews"

interface Product {
  _id: string
  name: string
  category: string
  slug: { current: string }
  price: number
  images: string[]
  stock: number
  // adicione os outros campos necessários
}

interface Rating {
  averageRating: number
  totalReviews: number
}

interface ProductWithRating {
  product: Product
  rating: Rating
}

interface ProductRecommendationsProps {
  currentProductId?: string
  category?: string
  title?: string
  limit?: number
}

export default function ProductRecommendations({
  currentProductId,
  category,
  title = "Produtos Relacionados",
  limit = 4,
}: ProductRecommendationsProps) {
  const [products, setProducts] = useState<ProductWithRating[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadRecommendations() {
      setIsLoading(true)
      try {
        const allProducts = await getProducts()

        let filteredProducts = allProducts.filter((product: Product) => {
          if (currentProductId && product._id === currentProductId) return false
          if (category && product.category !== category) return false
          return true
        })

        // Clone para não mutar original antes de sort
        filteredProducts = [...filteredProducts].sort(() => Math.random() - 0.5).slice(0, limit)

        const productsWithRatings: ProductWithRating[] = await Promise.all(
          filteredProducts.map(async (product: Product) => {
            const rating = await getProductRating(product._id)
            return { product, rating }
          }),
        )

        if (isMounted) {
          setProducts(productsWithRatings)
        }
      } catch (error) {
        console.error("Erro ao carregar recomendações:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadRecommendations()

    return () => {
      isMounted = false
    }
  }, [currentProductId, category, limit])

  if (isLoading) {
    return (
      <section className="py-8">
        <h3 className="text-xl font-bold mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(({ product, rating }) => (
          <ProductCard
            key={product._id}
            product={{
              ...product,
              images: product.images, // pass as string[]
            }}
            rating={rating}
          />
        ))}
      </div>
    </section>
  )
}

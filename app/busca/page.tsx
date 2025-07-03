"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { searchProducts } from "@/lib/search"
import { getCategories } from "@/lib/sanity"
import { getProductRating } from "@/lib/reviews"

// Tipagem para rating conforme ProductCard espera
interface Rating {
  averageRating: number
  totalReviews: number
}

// Tipo dos produtos com rating
interface ProductWithRating {
  product: any
  rating?: Rating
}

function SearchContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductWithRating[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    category: "all", // usar "all" para indicar todas as categorias
    minPrice: 0,
    maxPrice: 1000,
    sortBy: "newest" as const,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    performSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadCategories = async () => {
    const categoriesData = await getCategories()
    setCategories(categoriesData)
  }

  const performSearch = async () => {
    setLoading(true)
    try {
      const results = await searchProducts(filters.query, {
        category: filters.category === "all" ? undefined : filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
      })

      // Buscar ratings para cada produto
      const productsWithRatings: ProductWithRating[] = await Promise.all(
        results.map(async (product: any) => {
          const rating = await getProductRating(product._id)
          return { product, rating }
        }),
      )

      setProducts(productsWithRatings)
    } catch (error) {
      console.error("Erro na busca:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-black">
        {/* Filtros */}
        <div className="lg:col-span-1 ">
          <Card>
            <CardContent className="p-6 space-y-6 ">
              <div>
                <h3 className="font-semibold mb-3">Buscar</h3>
                <Input
  placeholder="Digite sua busca..."
  value={filters.query}
  onChange={(e) => handleFilterChange("query", e.target.value)}
  className="text-black "
/>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Categoria</h3>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug.current}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Faixa de Preço</h3>
                <div className="space-y-4">
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => {
                      handleFilterChange("minPrice", min)
                      handleFilterChange("maxPrice", max)
                    }}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>R$ {filters.minPrice}</span>
                    <span>R$ {filters.maxPrice}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Ordenar por</h3>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mais recentes</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                    <SelectItem value="name_asc">Nome A-Z</SelectItem>
                    <SelectItem value="name_desc">Nome Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={performSearch} className="w-full">
                Aplicar Filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {filters.query ? `Resultados para "${filters.query}"` : "Todos os Produtos"}
            </h1>
            <p className="text-gray-600">{products.length} produtos encontrados</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(({ product, rating }) => (
                <ProductCard key={product._id} product={product} rating={rating} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600 mb-4">Tente ajustar os filtros ou buscar por outros termos</p>
              <Button
                onClick={() =>
                  setFilters({ query: "", category: "all", minPrice: 0, maxPrice: 1000, sortBy: "newest" })
                }
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SearchContent />
    </Suspense>
  )
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Star, ShoppingCart } from "lucide-react"
import { urlFor } from "@/lib/sanity"
import { formatPrice } from "@/lib/utils"

interface Product {
  _id: string
  name: string
  slug: { current: string }
  price: number
  compareAtPrice?: number
  images: any[]
  category: string
  specifications?: { name: string; value: string }[]
  stock: number
  rating?: { averageRating: number; totalReviews: number }
}

interface ProductComparisonProps {
  initialProducts?: Product[]
}

export default function ProductComparison({ initialProducts = [] }: ProductComparisonProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isOpen, setIsOpen] = useState(false)
  const [showAllSpecs, setShowAllSpecs] = useState(false)

  useEffect(() => {
    // Carregar produtos do localStorage na montagem
    const saved = localStorage.getItem("comparison-products")
    if (saved) {
      try {
        const parsedProducts = JSON.parse(saved)
        setProducts(parsedProducts)
        setIsOpen(parsedProducts.length > 0)
      } catch (error) {
        console.error("Erro ao carregar comparação:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Salvar no localStorage só se houver produtos
    if (products.length > 0) {
      localStorage.setItem("comparison-products", JSON.stringify(products))
      setIsOpen(true)
    } else {
      localStorage.removeItem("comparison-products")
      setIsOpen(false)
    }
  }, [products])

  const addProduct = (product: Product) => {
    if (products.length >= 4) {
      alert("Você pode comparar no máximo 4 produtos")
      return
    }

    if (products.find((p) => p._id === product._id)) {
      alert("Este produto já está na comparação")
      return
    }

    setProducts([...products, product])
    setIsOpen(true)
  }

  const removeProduct = (productId: string) => {
    setProducts(products.filter((p) => p._id !== productId))
  }

  const clearAll = () => {
    if (confirm("Deseja realmente limpar todos os produtos da comparação?")) {
      setProducts([])
      setIsOpen(false)
    }
  }

  if (!isOpen || products.length === 0) return null

  // Obter todas as especificações únicas
  const allSpecs = Array.from(new Set(products.flatMap((p) => p.specifications?.map((s) => s.name) || [])))

  // Mostrar todas ou só as 3 primeiras especificações
  const specsToShow = showAllSpecs ? allSpecs : allSpecs.slice(0, 3)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 max-h-[80vh] overflow-y-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Comparar Produtos ({products.length}/4)</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}>
              Limpar Tudo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Fechar comparação">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product._id} className="relative">
              <button
                onClick={() => removeProduct(product._id)}
                className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                aria-label={`Remover ${product.name} da comparação`}
              >
                <X className="w-4 h-4" />
              </button>

              <CardHeader className="pb-2">
                <div className="relative aspect-square mb-2">
                  {product.images?.[0] ? (
                    <Image
                      src={urlFor(product.images[0])?.width(200).height(200).url() || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Sem imagem</span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-sm line-clamp-2">{product.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    ({product.rating?.averageRating?.toFixed(1) || "4.5"})
                  </span>
                </div>

                <div className="space-y-2">
                  {specsToShow.map((specName) => {
                    const spec = product.specifications?.find((s) => s.name === specName)
                    return (
                      <div key={specName} className="text-xs">
                        <span className="font-medium">{specName}:</span>
                        <span className="ml-1 text-gray-600">{spec?.value || "N/A"}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/produto/${product.slug.current}`}>Ver Detalhes</Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" disabled={product.stock === 0}>
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    {product.stock === 0 ? "Esgotado" : "Adicionar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Slot para adicionar produto */}
          {products.length < 4 && (
            <Card className="border-dashed border-2 border-gray-300 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Plus className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Adicione mais produtos</p>
              <p className="text-sm text-gray-500">para comparar</p>
            </Card>
          )}
        </div>

        {allSpecs.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={() => setShowAllSpecs(!showAllSpecs)}>
              {showAllSpecs ? "Ver Menos Especificações" : "Ver Todas as Especificações"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

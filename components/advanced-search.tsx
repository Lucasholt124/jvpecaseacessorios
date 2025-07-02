"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { getCategories } from "@/lib/sanity"
import { formatPrice } from "@/lib/utils"

interface SearchFilters {
  query: string
  category: string
  minPrice: number
  maxPrice: number
  inStock: boolean
  onSale: boolean
  rating: number
  sortBy: string
}

export default function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams?.get("q") || "",
    category: searchParams?.get("categoria") || "",
    minPrice: Number(searchParams?.get("min_preco")) || 0,
    maxPrice: Number(searchParams?.get("max_preco")) || 1000,
    inStock: searchParams?.get("estoque") === "true",
    onSale: searchParams?.get("promocao") === "true",
    rating: Number(searchParams?.get("avaliacao")) || 0,
    sortBy: searchParams?.get("ordenar") || "relevancia",
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data || [])
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
      }
    }

    loadCategories()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (filters.query) params.set("q", filters.query)
    if (filters.category) params.set("categoria", filters.category)
    if (filters.minPrice > 0) params.set("min_preco", filters.minPrice.toString())
    if (filters.maxPrice < 1000) params.set("max_preco", filters.maxPrice.toString())
    if (filters.inStock) params.set("estoque", "true")
    if (filters.onSale) params.set("promocao", "true")
    if (filters.rating > 0) params.set("avaliacao", filters.rating.toString())
    if (filters.sortBy !== "relevancia") params.set("ordenar", filters.sortBy)

    router.push(`/busca?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      minPrice: 0,
      maxPrice: 1000,
      inStock: false,
      onSale: false,
      rating: 0,
      sortBy: "relevancia",
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "query" || key === "sortBy") return false
    if (key === "minPrice") return value > 0
    if (key === "maxPrice") return value < 1000
    return Boolean(value)
  }).length

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Buscar produtos..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pr-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            type="button"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg max-h-[80vh] overflow-y-auto bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug.current}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar por */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevância</SelectItem>
                    <SelectItem value="menor_preco">Menor Preço</SelectItem>
                    <SelectItem value="maior_preco">Maior Preço</SelectItem>
                    <SelectItem value="mais_vendidos">Mais Vendidos</SelectItem>
                    <SelectItem value="melhor_avaliacao">Melhor Avaliação</SelectItem>
                    <SelectItem value="lancamentos">Lançamentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Avaliação */}
              <div className="space-y-2">
                <Label>Avaliação Mínima</Label>
                <Select
                  value={filters.rating.toString()}
                  onValueChange={(value) => setFilters({ ...filters, rating: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Qualquer avaliação</SelectItem>
                    <SelectItem value="4">4+ estrelas</SelectItem>
                    <SelectItem value="3">3+ estrelas</SelectItem>
                    <SelectItem value="2">2+ estrelas</SelectItem>
                    <SelectItem value="1">1+ estrelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Faixa de Preço */}
            <div className="space-y-4">
              <Label>Faixa de Preço</Label>
              <div className="px-2">
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                  max={1000}
                  step={10}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatPrice(filters.minPrice)}</span>
                <span>{formatPrice(filters.maxPrice)}</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={filters.inStock}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFilters({ ...filters, inStock: Boolean(checked) })
                  }
                />
                <Label htmlFor="inStock" className="text-sm">
                  Apenas em estoque
                </Label>
                </div>

                <div className="flex items-center space-x-2">
                <Checkbox
                  id="onSale"
                  checked={filters.onSale}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                  setFilters({ ...filters, onSale: Boolean(checked) })
                  }
                />
                <Label htmlFor="onSale" className="text-sm">
                  Em promoção
                </Label>
                </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSearch} className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

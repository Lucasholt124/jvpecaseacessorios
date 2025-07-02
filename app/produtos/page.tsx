import { Suspense } from "react"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getProducts, getCategories } from "@/lib/sanity"
import { getProductRating } from "@/lib/reviews"
import OrderSelect from "@/components/order-select" // <--- importe aqui

interface ProductsPageProps {
  searchParams: {
    categoria?: string
    ordenar?: string
  }
}

interface Category {
  _id: string
  name: string
  slug: {
    current: string
  }
}

interface Product {
  _id: string
  name: string
  price: number
  categorySlug: string
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  // Filtro por categoria
  let filteredProducts = products
  if (searchParams.categoria) {
    filteredProducts = products.filter(
      (product: Product) => product.categorySlug === searchParams.categoria
    )
  }

  // Ordenação
  switch (searchParams.ordenar) {
    case "preco-menor":
      filteredProducts.sort((a: Product, b: Product) => a.price - b.price)
      break
    case "preco-maior":
      filteredProducts.sort((a: Product, b: Product) => b.price - a.price)
      break
    case "nome":
      filteredProducts.sort((a: Product, b: Product) => a.name.localeCompare(b.name))
      break
    default:
      break
  }

  const productsWithRatings = await Promise.all(
    filteredProducts.map(async (product: Product) => {
      const rating = await getProductRating(product._id)
      return { product, rating }
    })
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Título e contagem */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {searchParams.categoria
            ? `Categoria: ${
                categories.find((cat: Category) => cat.slug.current === searchParams.categoria)
                  ?.name || "Produtos"
              }`
            : "Todos os Produtos"}
        </h1>
        <p className="text-gray-600">
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} encontrado
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Filtro por categoria */}
              <div>
                <h3 className="font-semibold mb-3">Categorias</h3>
                <div className="space-y-2">
                  <Link
                    href="/produtos"
                    className={`block p-2 rounded hover:bg-gray-100 ${
                      !searchParams.categoria ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    Todas as Categorias
                  </Link>
                  {categories.map((cat: Category) => (
                    <Link
                      key={cat._id}
                      href={`/produtos?categoria=${cat.slug.current}`}
                      className={`block p-2 rounded hover:bg-gray-100 ${
                        searchParams.categoria === cat.slug.current ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div>
                <h3 className="font-semibold mb-3">Ordenar por</h3>
                <OrderSelect categoria={searchParams.categoria} ordenar={searchParams.ordenar} />
              </div>

              {/* Filtro por preço */}
              <div>
                <h3 className="font-semibold mb-3">Faixa de Preço</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Até R$ 50
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    R$ 50 - R$ 100
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    R$ 100 - R$ 200
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Acima de R$ 200
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listagem de produtos */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos produtos para os filtros selecionados.
                </p>
                <Button asChild>
                  <Link href="/produtos">Ver Todos os Produtos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Suspense fallback={<ProductsLoading />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsWithRatings.map(({ product, rating }) => (
                  <ProductCard key={product._id} product={product} rating={rating} />
                ))}
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 aspect-square rounded-lg mb-4" />
          <div className="bg-gray-200 h-4 rounded mb-2" />
          <div className="bg-gray-200 h-4 rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

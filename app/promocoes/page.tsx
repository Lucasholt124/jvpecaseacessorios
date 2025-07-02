import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/sanity"
import { Card, CardContent } from "@/components/ui/card"

export default async function PromocoesPage() {
  const products = await getProducts()

  // Filtrar apenas produtos com desconto real
  const discountedProducts = products.filter(
    (product: any) => product.compareAtPrice && product.compareAtPrice > product.price
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Promoções</h1>
        <p className="text-gray-600 text-lg">Aproveite nossas ofertas especiais em produtos selecionados!</p>
      </div>

      {discountedProducts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma promoção encontrada</h3>
            <p className="text-gray-600">Assim que novas promoções forem ativadas, você verá elas aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discountedProducts.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

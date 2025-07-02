import ProductCard from "@/components/product-card"
import { getFeaturedProducts } from "@/lib/sanity"
import { getProductRating } from "@/lib/reviews"

export default async function FeaturedProducts() {
  const data = await getFeaturedProducts()

  const productsWithRatings = await Promise.all(
    data.slice(0, 8).map(async (product: any) => {
      const rating = await getProductRating(product._id)
      return { product, rating }
    })
  )

  if (productsWithRatings.length === 0) {
    return (
      <section className="py-16 ">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Produtos em Destaque</h2>
          <p className="text-gray-100 mb-8">Adicione produtos no Sanity Studio para vê-los aqui</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-yellow-500" >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">Produtos em Destaque</h2>
          <p className="text-gray-100 max-w-2xl mx-auto text-lg">
            Confira nossos produtos mais populares e com melhor avaliação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {productsWithRatings.map(({ product, rating }) => (
            <ProductCard key={product._id} product={product} rating={rating} />
          ))}
        </div>
      </div>
    </section>
  )
}

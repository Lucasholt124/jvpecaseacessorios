import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCategories, getProducts, urlFor } from "@/lib/sanity"

export default async function CategoriasPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  // Contar produtos por categoria
  const categoriesWithCount = categories.map((category: any) => {
    const productCount = products.filter((product: any) => product.categorySlug === category.slug.current).length
    return { ...category, productCount }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nossas Categorias</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore nossa ampla variedade de peças e acessórios organizados por categoria
        </p>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-gray-600">As categorias serão exibidas aqui quando forem criadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoriesWithCount.map((category: any) => (
            <Link key={category._id} href={`/produtos?categoria=${category.slug.current}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    {category.image ? (
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <Image
                          src={urlFor(category.image)?.width(80).height(80).url() || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover rounded-full group-hover:scale-110 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}

                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
                    )}

                    <Badge
                      variant="secondary"
                      className="group-hover:bg-primary group-hover:text-white transition-colors"
                    >
                      {category.productCount} produto{category.productCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Seção de Destaque */}
      <div className="mt-16 bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Não encontrou o que procura?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Entre em contato conosco! Temos uma ampla rede de fornecedores e podemos encontrar a peça que você precisa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contato"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Fale Conosco
          </Link>
          <Link
            href="https://wa.me/5579996828167"
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            WhatsApp
          </Link>
        </div>
      </div>
    </div>
  )
}

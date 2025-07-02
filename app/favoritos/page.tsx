import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"

import { getUserFavorites } from "@/lib/wishlist" // sua função para pegar os favoritos do Prisma
import { sanityClient } from "@/lib/sanity"

// Definição do tipo Product para tipagem dos produtos
interface Product {
  _id: string
  name: string
  price: number
  image?: string
  stock?: number
}

// Função para buscar produtos no Sanity por array de IDs
async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  const query = `*[_type == "product" && _id in $ids] {
    _id,
    name,
    price,
    "image": images[0].asset->url,
    stock
  }`

  const products: Product[] = await sanityClient.fetch(query, { ids })

  return products || []
}

export default async function FavoritosPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  // Busca os IDs favoritos do usuário no banco (Prisma)
  const favoriteIds = await getUserFavorites(user.id)
  // Busca os dados completos desses produtos no Sanity
  const products = await getProductsByIds(favoriteIds)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lista de Desejos</h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? "produto" : "produtos"} na sua lista
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sua lista está vazia</h3>
            <p className="text-gray-600 mb-6">
              Adicione produtos à sua lista de desejos para acompanhar seus favoritos
            </p>
            <Button asChild size="lg">
              <Link href="/produtos">Explorar Produtos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold line-clamp-2">{product.name}</h3>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">R$ {product.price.toFixed(2)}</span>
                    {(!product.stock || product.stock <= 0) && (
                      <span className="text-sm text-red-600 font-medium">Esgotado</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" disabled={!product.stock || product.stock <= 0}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.stock && product.stock > 0 ? "Adicionar" : "Esgotado"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

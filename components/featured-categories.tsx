"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getCategories, urlFor } from "@/lib/sanity"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  _id: string
  name: string
  slug: { current: string }
  image?: any
  description?: string
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data.slice(0, 8)) // Mostrar apenas 8 categorias
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Nossas Categorias</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore nossa ampla variedade de peças e acessórios organizados por categoria
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            let imageUrl = "/placeholder.svg"
            if (category.image) {
              const builder = urlFor(category.image)
              if (builder) {
                imageUrl = builder.width(64).height(64).url()
              }
            }

            return (
              <Link key={category._id} href={`/produtos?categoria/${category.slug.current}`} className="group">
                <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  {category.image && (
                    <div className="relative w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full">
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {!category.image && (
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{category.name.charAt(0)}</span>
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{category.description}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

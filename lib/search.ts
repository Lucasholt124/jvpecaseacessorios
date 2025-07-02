"use server"

import { sanityClient } from "./sanity"
import type { Product } from "./types"

export async function searchProducts(
  query: string,
  filters?: {
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest"
  }
): Promise<Product[]> {
  try {
    let sanityQuery = `*[_type == "product" && isActive == true`

    if (query) {
      sanityQuery += ` && (
        name match $query ||
        description match $query ||
        tags[] match $query
      )`
    }

    if (filters?.category) {
      sanityQuery += ` && category->slug.current == $category`
    }

    if (filters?.minPrice !== undefined) {
      sanityQuery += ` && price >= $minPrice`
    }
    if (filters?.maxPrice !== undefined) {
      sanityQuery += ` && price <= $maxPrice`
    }

    sanityQuery += `]`

    switch (filters?.sortBy) {
      case "price_asc":
        sanityQuery += ` | order(price asc)`
        break
      case "price_desc":
        sanityQuery += ` | order(price desc)`
        break
      case "name_asc":
        sanityQuery += ` | order(name asc)`
        break
      case "name_desc":
        sanityQuery += ` | order(name desc)`
        break
      case "newest":
      default:
        sanityQuery += ` | order(_createdAt desc)`
    }

    sanityQuery += ` {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "category": category->name,
      "categorySlug": category->slug.current,
      images,
      stock,
      isFeatured
    }`

    const params: Record<string, any> = {}
    if (query) params.query = `${query}*`
    if (filters?.category) params.category = filters.category
    if (filters?.minPrice !== undefined) params.minPrice = filters.minPrice
    if (filters?.maxPrice !== undefined) params.maxPrice = filters.maxPrice

    const products = await sanityClient.fetch(sanityQuery, params)
    return products
  } catch (error) {
    console.error("Erro na busca:", error)
    return []
  }
}

export async function getSearchSuggestions(query: string) {
  try {
    query = query?.trim() || ""

    if (query.length === 0) return []

    const sanityQuery = `*[_type == "product" && isActive == true && name match $query][0...5] {
      name,
      slug
    }`

    const params: Record<string, any> = { query: `${query}*` }

    const suggestions = await sanityClient.fetch(sanityQuery, params)
    return suggestions
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error)
    return []
  }
}

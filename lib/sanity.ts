import { createClient } from "next-sanity"
import imageUrlBuilder from "@sanity/image-url"
import { cache } from "react"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01"

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID")
}

if (!dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET")
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production",
  token: process.env.SANITY_API_TOKEN,
  perspective: "published",
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  if (!source) return null
  return builder.image(source)
}

// Função segura para URLs de imagem
export function getImageUrl(image: any, width?: number, height?: number): string {
  if (!image) {
    return `/placeholder.svg?height=${height || 400}&width=${width || 400}`
  }

  try {
    const imageBuilder = urlFor(image)
    if (!imageBuilder) {
      return `/placeholder.svg?height=${height || 400}&width=${width || 400}`
    }

    let url = imageBuilder.auto("format").fit("max")

    if (width && height) {
      url = url.width(width).height(height)
    } else if (width) {
      url = url.width(width)
    } else if (height) {
      url = url.height(height)
    }

    const finalUrl = url.url()
    return finalUrl || `/placeholder.svg?height=${height || 400}&width=${width || 400}`
  } catch (error) {
    console.error("Erro ao processar imagem:", error)
    return `/placeholder.svg?height=${height || 400}&width=${width || 400}`
  }
}

// Função para buscar configurações do site
export const getSiteSettings = cache(async () => {
  try {
    const query = `*[_type == "siteSettings"][0] {
      title,
      description,
      keywords,
      logo,
      favicon,
      socialMedia
    }`

    const settings = await sanityClient.fetch(
      query,
      {},
      {
        next: { revalidate: 3600 }, // só next revalidate, remove cache: "force-cache"
      },
    )

    return (
      settings || {
        title: "JVPECASEACESSORIOS - Peças e Acessórios Automotivos",
        description:
          "Loja especializada em peças e acessórios automotivos com os melhores preços e qualidade garantida.",
        keywords: "peças automotivas, acessórios, carros, motos, qualidade, preço baixo",
      }
    )
  } catch (error) {
    console.error("Erro ao buscar configurações do site:", error)
    return {
      title: "JVPECASEACESSORIOS - Peças e Acessórios Automotivos",
      description: "Loja especializada em peças e acessórios automotivos com os melhores preços e qualidade garantida.",
      keywords: "peças automotivas, acessórios, carros, motos, qualidade, preço baixo",
    }
  }
})

// Cache das queries para melhor performance
export const getProducts = cache(async () => {
  try {
    const query = `*[_type == "product" && isActive == true] | order(_createdAt desc) {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "category": category->name,
      "categorySlug": category->slug.current,
      images[] {
        asset->{
          _id,
          url
        },
        alt
      },
      video,
      stock,
      isFeatured,
      tags,
      specifications,
      seo,
      sku,
      weight,
      dimensions
    }`

    const products = await sanityClient.fetch(
      query,
      {},
      {
        next: { revalidate: 60 }, // só next revalidate
      },
    )

    return products || []
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return []
  }
})

export const getFeaturedProducts = cache(async () => {
  try {
    const query = `*[_type == "product" && isActive == true && isFeatured == true] | order(_createdAt desc) [0...8] {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "category": category->name,
      "categorySlug": category->slug.current,
      images[] {
        asset->{
          _id,
          url
        },
        alt
      },
      stock
    }`

    const products = await sanityClient.fetch(
      query,
      {},
      {
        next: { revalidate: 60 }, // só next revalidate
      },
    )

    return products || []
  } catch (error) {
    console.error("Erro ao buscar produtos em destaque:", error)
    return []
  }
})

export const getProduct = cache(async (slug: string) => {
  try {
    if (!slug) return null

    const query = `*[_type == "product" && slug.current == $slug && isActive == true][0] {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "category": category->name,
      "categorySlug": category->slug.current,
      images[] {
        asset->{
          _id,
          url
        },
        alt
      },
      video,
      stock,
      tags,
      specifications,
      seo,
      sku,
      weight,
      dimensions
    }`

    const product = await sanityClient.fetch(
      query,
      { slug },
      {
        next: { revalidate: 60 }, // só next revalidate
      },
    )

    return product || null
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }
})

export const getCategories = cache(async () => {
  try {
    const query = `*[_type == "category" && isActive == true] | order(order asc, name asc) {
      _id,
      name,
      slug,
      description,
      image {
        asset->{
          _id,
          url
        },
        alt
      },
      color,
      order
    }`

    const categories = await sanityClient.fetch(
      query,
      {},
      {
        next: { revalidate: 300 }, // só next revalidate
      },
    )

    return categories || []
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }
})

export const getBanners = cache(async () => {
  try {
    const now = new Date().toISOString()

    const query = `*[_type == "banner" && isActive == true &&
      (!defined(startDate) || startDate <= $now) &&
      (!defined(endDate) || endDate >= $now)
    ] | order(order asc) {
      _id,
      title,
      subtitle,
      description,
      image {
        asset->{
          _id,
          url
        },
        alt
      },
      buttonText,
      buttonLink,
      order
    }`

    const banners = await sanityClient.fetch(
      query,
      { now },
      {
        next: { revalidate: 300 }, // só next revalidate
      },
    )

    return banners || []
  } catch (error) {
    console.error("Erro ao buscar banners:", error)
    return []
  }
})

export const searchProducts = cache(async (searchTerm: string) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) return []

    const query = `*[_type == "product" && isActive == true && (
      name match $searchTerm + "*" ||
      description match $searchTerm + "*" ||
      tags[] match $searchTerm + "*" ||
      category->name match $searchTerm + "*"
    )] | order(_score desc, _createdAt desc) {
      _id,
      name,
      slug,
      description,
      price,
      compareAtPrice,
      "category": category->name,
      "categorySlug": category->slug.current,
      images[] {
        asset->{
          _id,
          url
        },
        alt
      },
      stock
    }`

    const products = await sanityClient.fetch(
      query,
      { searchTerm },
      {
        next: { revalidate: 60 }, // só next revalidate
      },
    )

    return products || []
  } catch (error) {
    console.error("Erro na busca:", error)
    return []
  }
})

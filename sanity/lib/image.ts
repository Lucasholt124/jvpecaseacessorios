import createImageUrlBuilder from "@sanity/image-url"
import type { Image } from "sanity"
import { dataset, projectId } from "../env"

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
})

export const urlForImage = (source: Image | null | undefined) => {
  if (!source?.asset?._ref) {
    return null
  }

  return imageBuilder.image(source).auto("format").fit("crop")
}

export const getImageUrl = (image: Image | null | undefined, width?: number, height?: number): string => {
  if (!image) {
    return `/placeholder.svg?height=${height || 400}&width=${width || 400}`
  }

  try {
    const builder = urlForImage(image)
    if (!builder) {
      return `/placeholder.svg?height=${height || 400}&width=${width || 400}`
    }

    if (width) {
      builder.width(width)
    }
    if (height) {
      builder.height(height)
    }

    const url = builder.url()

    return url || `/placeholder.svg?height=${height || 400}&width=${width || 400}`
  } catch (error) {
    console.error("Erro ao gerar URL da imagem:", error)
    return `/placeholder.svg?height=${height || 400}&width=${width || 400}`
  }
}

/**
 * Extrai o objeto focal (hotspot) e converte em string CSS para object-position
 * Exemplo de hotspot: { x: 0.5, y: 0.5 }
 * Convertido para: "50% 50%"
 */
export const getObjectPosition = (image: Image | null | undefined): string => {
  if (!image || !image.hotspot) {
    // Centro padrão se não tiver hotspot
    return "50% 50%"
  }
  const x = Math.round((image.hotspot.x ?? 0.5) * 100)
  const y = Math.round((image.hotspot.y ?? 0.5) * 100)
  return `${x}% ${y}%`
}

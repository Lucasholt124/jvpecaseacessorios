"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { urlFor } from "@/lib/sanity"

interface Media {
  _type: "image" | "video"
  asset: { _ref?: string; _type?: string; url?: string }
  alt?: string
}

interface ProductCarouselProps {
  images: Media[]
  video?: Media
  productName: string
}

export default function ProductCarousel({ images, video, productName }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  const allMedia: Media[] = [...images]
  if (video) allMedia.push({ ...video, _type: "video" })

  const getUrl = (media: Media, w = 600, h = 400): string => {
    if (media._type === "video" && media.asset.url) return media.asset.url
    const builder = urlFor(media)
    return builder ? builder.width(w).height(h).url() : "/placeholder.svg"
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length)
    setShowVideo(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)
    setShowVideo(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setShowVideo(allMedia[index]._type === "video")
  }

  const currentMedia = allMedia[currentIndex]

  if (allMedia.length === 0) {
    return (
      <div className="w-full max-w-lg aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Sem mídia</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Principal */}
      <div className="relative w-full aspect-[4/3] bg-white rounded-lg overflow-hidden group shadow-sm">
        {currentMedia._type === "video" && showVideo ? (
          <video
            controls
            className="w-full h-full object-contain bg-black"
            poster={images[0] ? getUrl(images[0]) : undefined}
          >
            <source src={currentMedia.asset.url} type="video/mp4" />
            Seu navegador não suporta vídeo.
          </video>
        ) : (
          <>
            <Image
              src={getUrl(currentMedia)}
              alt={currentMedia.alt || productName}
              fill
              className="object-contain bg-white transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 600px"
              priority
            />
            {currentMedia._type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowVideo(true)}
                  className="rounded-full shadow"
                  aria-label="Reproduzir vídeo"
                >
                  <Play className="w-6 h-6" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Navegação lateral */}
        {allMedia.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              aria-label="Próximo slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex ? "border-primary ring-2 ring-primary" : "border-gray-200"
              }`}
              aria-label={`Selecionar mídia ${index + 1}`}
              aria-current={index === currentIndex}
              type="button"
            >
              <Image
                src={getUrl(media, 64, 64)}
                alt={`${productName} ${index + 1}`}
                width={64}
                height={64}
                className="object-cover"
              />
              {media._type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

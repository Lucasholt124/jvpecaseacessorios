"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { urlFor } from "@/lib/sanity"

interface ProductCarouselProps {
  images: any[]
  video?: any
  productName: string
}

export default function ProductCarousel({ images, video, productName }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const allMedia = [...images]
  if (video) {
    allMedia.push({ _type: "video", asset: video })
  }

  const getUrl = (media: any, w = 600, h = 600) => {
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

  const togglePaused = () => {
    setPaused((prev) => !prev)
  }

  useEffect(() => {
    if (allMedia.length <= 1 || paused) return
    intervalRef.current = setInterval(() => nextSlide(), 5000)
    return () => clearInterval(intervalRef.current!)
  }, [paused, allMedia.length])

  const currentMedia = allMedia[currentIndex]

  if (allMedia.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Sem imagem</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Imagem/Vídeo Principal */}
      <div className="relative aspect-square bg-white rounded-lg overflow-hidden group shadow-md">
        {currentMedia._type === "video" && showVideo ? (
          <video
            controls
            className="w-full h-full object-contain"
            poster={images.length > 0 ? getUrl(images[0]) : undefined}
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
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain bg-white transition-transform duration-500 group-hover:scale-102"
            />
            {currentMedia._type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowVideo(true)}
                  className="rounded-full"
                  aria-label="Reproduzir vídeo"
                >
                  <Play className="w-6 h-6" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Navegação */}
        {allMedia.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80"
              onClick={prevSlide}
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80"
              onClick={nextSlide}
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-2 right-2 bg-white/80"
              onClick={togglePaused}
              aria-label={paused ? "Reproduzir carrossel" : "Pausar carrossel"}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
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
              aria-label={`Selecionar slide ${index + 1}`}
              aria-current={index === currentIndex}
            >
              <Image
                src={getUrl(media, 64, 64)}
                alt={`${productName} ${index + 1}`}
                fill
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

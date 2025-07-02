"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { getBanners, urlFor } from "@/lib/sanity"
import placeholderImage from "@/public/placeholder.png"

interface Banner {
  _id: string
  title: string
  subtitle?: string
  description?: string
  image?: {
    _type: "image"
    asset: {
      _id: string
      url: string
    }
    alt?: string
    hotspot?: {
      x: number
      y: number
      height: number
      width: number
    }
  }
  buttonText?: string
  buttonLink?: string
  isActive: boolean
}

function getObjectPosition(image?: Banner["image"]): string {
  if (!image?.hotspot) return "50% 50%"
  const x = Math.min(Math.max(image.hotspot.x ?? 0.5, 0), 1) * 100
  const y = Math.min(Math.max(image.hotspot.y ?? 0.5, 0), 1) * 100
  return `${x}% ${y}%`
}

export default function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getBanners()
        setBanners(result.filter((b: Banner) => b.isActive))
      } catch (err) {
        console.error("Erro ao carregar banners:", err)
      }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (banners.length === 0 || paused) return

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(intervalRef.current!)
  }, [banners, paused])

  const nextSlide = () => setCurrent((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  const togglePause = () => setPaused((prev) => !prev)

  if (banners.length === 0) return null

  return (
    <section
      className="relative w-full min-h-[320px] md:min-h-[450px] lg:min-h-[600px] overflow-hidden"
      aria-label="Banner rotativo da loja"
    >
      {banners.map((banner, i) => {
        const imageUrl =
          urlFor(banner.image)?.width(1920).height(800).fit("crop").auto("format").url() ?? placeholderImage.src
        const isActive = i === current
        const objectPosition = getObjectPosition(banner.image)

        return (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={imageUrl}
              alt={banner.image?.alt || banner.title}
              fill
              style={{ objectPosition }}
              className="object-cover"
              priority={isActive}
              sizes="100vw"
            />

            {/* camada de escurecimento suave para contraste */}
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

            {/* conteúdo centralizado e responsivo */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center text-white max-w-3xl space-y-6 md:space-y-8 px-6 py-8 backdrop-blur-sm bg-black/30 rounded-lg w-full md:w-3/4 lg:w-2/3">
                <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">{banner.title}</h1>

                {banner.subtitle && (
                  <p className="text-lg md:text-xl drop-shadow-sm font-medium">{banner.subtitle}</p>
                )}

                {banner.description && (
                  <p className="text-base md:text-lg mx-auto opacity-90">{banner.description}</p>
                )}

                {banner.buttonText && banner.buttonLink && (
                  <Button
                    size="lg"
                    asChild
                    className="hover:scale-105 transition-transform bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
                  >
                    <Link href={banner.buttonLink}>{banner.buttonText}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Botões de navegação */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-30"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-30"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Botão de pausa/reproduzir */}
      <button
        onClick={togglePause}
        className="absolute bottom-4 right-4 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-30"
        aria-label={paused ? "Reproduzir banner" : "Pausar banner"}
      >
        {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </button>

      {/* Indicadores de slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            aria-current={i === current ? "true" : undefined}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  )
}

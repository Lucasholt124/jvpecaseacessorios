"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { getBanners, urlFor } from "@/lib/sanity"
import placeholderImage from "@/public/placeholder-logo.png"
import Image from "next/image"

interface Banner {
  _id: string
  title: string
  subtitle?: string
  image?: {
    _type?: string
    asset?: {
      _id?: string
      url?: string
      _ref?: string
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
}

function getObjectPosition(image?: Banner["image"]): string {
  if (!image?.hotspot) return "50% 50%"
  const x = Math.min(Math.max(image.hotspot.x ?? 0.5, 0), 1) * 100
  const y = Math.min(Math.max(image.hotspot.y ?? 0.5, 0), 1) * 100
  return `${x}% ${y}%`
}

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const fetched = await getBanners()
        const correctedBanners = (fetched || []).map((banner: Banner) => {
          if (banner.buttonLink?.toLowerCase() === "/produtos") {
            return {
              ...banner,
              buttonLink: "/produtos",
            }
          }
          return banner
        })
        setBanners(correctedBanners)
      } catch (err) {
        console.error("Erro ao buscar banners:", err)
      }
    }
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length === 0 || isPaused) return

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [banners, isPaused])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  const togglePause = () => setIsPaused((prev) => !prev)

  const handleCTAClick = () => {
    router.push("/produtos")
  }

  if (banners.length === 0) return null

  return (
    <div
      className="relative w-full min-h-[320px] md:min-h-[450px] lg:min-h-[600px] overflow-hidden bg-gray-200"
      role="region"
      aria-label="Carrossel de banners"
    >
      {banners.map((banner, index) => {
        const imageUrl = banner.image
          ? urlFor(banner.image)?.width(1920).height(800).fit("crop").auto("format").url() ?? placeholderImage.src
          : placeholderImage.src
        const isActive = index === currentSlide
        const objectPosition = getObjectPosition(banner.image)

        return (
          <div
            key={banner._id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            <Image
              src={imageUrl}
              alt={banner.image?.alt || banner.title || "Banner"}
              fill
              style={{ objectPosition }}
              className="object-cover"
              priority={isActive}
              sizes="100vw"
            />

            {/* Overlay escuro para melhorar contraste do texto */}
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

            {/* Conteúdo do banner */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="max-w-4xl text-center text-white space-y-6 md:space-y-8 px-6 py-8
                backdrop-blur-sm bg-black/30 rounded-lg
                mx-auto
                w-full
                md:w-3/4
                lg:w-2/3
              ">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold drop-shadow-lg">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="text-md md:text-lg lg:text-xl drop-shadow-md font-medium">
                    {banner.subtitle}
                  </p>
                )}
                {banner.buttonText && banner.buttonLink && (
                  <button
                    onClick={handleCTAClick}
                    className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 rounded-lg font-semibold transition-colors shadow-md"
                  >
                    {banner.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Controles */}
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-30"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-30"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Botão Pausar/Reproduzir */}
      <button
        onClick={togglePause}
        aria-label={isPaused ? "Reproduzir carrossel" : "Pausar carrossel"}
        className="absolute bottom-4 right-4 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full z-30"
      >
        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Ir para o slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : undefined}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

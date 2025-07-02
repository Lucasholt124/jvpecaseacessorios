"use client"

import { SiWhatsapp } from "react-icons/si"
import { useState, useTransition, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Heart,
  Share2,
  X,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

interface ProductActionsProps {
  productId: string
  productName: string
  productPrice: number
  productImage: string
  productInStock: boolean
  isFavorited: boolean
}

export default function ProductActions({
  productId,
  productName,
  productPrice,
  productImage,
  productInStock,
  isFavorited: initialFavorite,
}: ProductActionsProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorite)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [currentUrl, setCurrentUrl] = useState("")

  // Pega URL atual somente no cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href)
    }
  }, [])

  async function toggleFavorite() {
    if (isPending) return
    startTransition(async () => {
      const method = isFavorited ? "DELETE" : "POST"
      try {
        const res = await fetch("/api/wishlist", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
          credentials: "include",
        })

        if (res.ok) {
          setIsFavorited(!isFavorited)
          router.refresh()
          toast.success(
            isFavorited
              ? "Produto removido dos favoritos"
              : "Produto adicionado aos favoritos"
          )
        } else {
          const data = await res.json()
          toast.error(data.error || "Erro ao atualizar favoritos.")
        }
      } catch (err) {
        console.error("Erro na requisição:", err)
        toast.error("Erro de rede ou servidor.")
      }
    })
  }

  function openShareModal() {
    setCopySuccess(null)
    setIsModalOpen(true)
  }

  function closeShareModal() {
    setIsModalOpen(false)
    setCopySuccess(null)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopySuccess("Link copiado!")
      toast.success("Link copiado para a área de transferência!")
    } catch {
      setCopySuccess("Erro ao copiar link.")
      toast.error("Erro ao copiar link.")
    }
  }

  // Fechar modal clicando fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeShareModal()
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

  // Fechar modal com ESC
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") closeShareModal()
    }
    if (isModalOpen) {
      document.addEventListener("keydown", handleEsc)
    } else {
      document.removeEventListener("keydown", handleEsc)
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isModalOpen])

  const encodedURL = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(productName)

  const socialLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedURL}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedURL}`,
    telegram: `https://t.me/share/url?url=${encodedURL}&text=${encodedTitle}`,
  }

  return (
    <>
      <div className="flex gap-3 flex-wrap items-center">
        {/* Favoritar */}
        <Button
          variant={isFavorited ? "default" : "outline"}
          size="lg"
          onClick={toggleFavorite}
          disabled={isPending}
          aria-pressed={isFavorited}
          aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Heart
            className="w-5 h-5"
            fill={isFavorited ? "red" : "none"}
            color={isFavorited ? "red" : "currentColor"}
            aria-hidden="true"
          />
        </Button>

        {/* Compartilhar */}
        <Button
          variant="outline"
          size="lg"
          onClick={openShareModal}
          aria-label="Compartilhar produto"
          title="Compartilhar produto"
          className="flex items-center gap-2 transition-colors duration-200 hover:bg-blue-100 focus:bg-blue-100"
        >
          <Share2
            className="w-6 h-6 text-blue-600"
            aria-hidden="true"
          />
          Compartilhar
        </Button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 id="share-modal-title" className="text-xl font-semibold mb-4">
                Compartilhar produto
              </h2>
              <p className="mb-4 break-words select-all">{currentUrl}</p>

              <div className="grid grid-cols-4 gap-4 mb-4">
                {/* WhatsApp */}
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartilhar no WhatsApp"
                  className="
                    flex flex-col items-center justify-center
                    w-16 h-16
                    bg-green-100 text-green-700
                    rounded-xl
                    shadow-sm
                    hover:bg-green-200 hover:text-green-800
                    transition
                    duration-300
                    select-none
                    focus:outline-none focus:ring-2 focus:ring-green-400
                  "
                >
                  <SiWhatsapp className="w-8 h-8" />
                  <span className="text-xs mt-2 font-semibold">WhatsApp</span>
                </a>
                {/* Facebook */}
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartilhar no Facebook"
                  className="flex flex-col items-center justify-center text-blue-600 hover:text-blue-700 transition"
                >
                  <Facebook className="w-8 h-8" />
                  <span className="text-xs mt-1">Facebook</span>
                </a>

                {/* Twitter */}
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartilhar no Twitter"
                  className="flex flex-col items-center justify-center text-blue-400 hover:text-blue-500 transition"
                >
                  <Twitter className="w-8 h-8" />
                  <span className="text-xs mt-1">Twitter</span>
                </a>

                {/* Telegram */}
                <a
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Compartilhar no Telegram"
                  className="flex flex-col items-center justify-center text-blue-500 hover:text-blue-600 transition"
                >
                  <Send className="w-8 h-8" />
                  <span className="text-xs mt-1">Telegram</span>
                </a>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={copyLink} variant="default" size="sm">
                  Copiar link
                </Button>
                <Button onClick={closeShareModal} variant="ghost" size="sm" aria-label="Fechar modal">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {copySuccess && (
                <p
                  className={`mt-4 ${
                    copySuccess.includes("Erro") ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {copySuccess}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

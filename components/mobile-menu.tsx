"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
  user?: {
    name: string
  } | null
  onLogout?: () => void
}

export default function MobileMenu({ isOpen, onClose, onSearch, user, onLogout }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const startX = useRef<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  // Suporte a swipe com touch ou mouse
  const handleStart = (x: number) => (startX.current = x)

  const handleMove = (x: number) => {
    if (startX.current === null) return
    const deltaX = x - startX.current
    if (deltaX < -80) {
      onClose()
      startX.current = null
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        className={`absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-4 overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => {
          if (e.buttons === 1) handleMove(e.clientX)
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearch(searchQuery)
            onClose()
          }}
          className="flex gap-2 mb-4"
        >
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-black"
          />
          <Button type="submit" aria-label="Buscar">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <nav className="space-y-3">
          <Link href="/produtos" className="block font-medium text-gray-800 hover:text-blue-600" onClick={onClose}>
            Todos os Produtos
          </Link>
          <Link href="/categorias" className="block font-medium text-gray-800 hover:text-blue-600" onClick={onClose}>
            Categorias
          </Link>
          <Link href="/promocoes" className="block font-medium text-gray-800 hover:text-blue-600" onClick={onClose}>
            Promoções
          </Link>
          <Link href="/contato" className="block font-medium text-gray-800 hover:text-blue-600" onClick={onClose}>
            Contato
          </Link>
        </nav>

        <hr className="my-4" />

        {user ? (
          <div className="space-y-2">
            <Link href="/perfil" className="block font-semibold text-blue-600 hover:text-yellow-600" onClick={onClose}>
              Meu Perfil ({user.name})
            </Link>
            <button
              onClick={() => {
                if (onLogout) onLogout()
                onClose()
              }}
              className="w-full text-left text-red-600 hover:underline"
            >
              Sair
            </button>
          </div>
        ) : (
          <Link href="/login" className="block py-2 text-gray-700 hover:text-blue-600" onClick={onClose}>
            Entrar / Cadastrar
          </Link>
        )}
        <Link href="/favoritos" className="block py-2 text-gray-700 hover:text-blue-600" onClick={onClose}>
          Meus Favoritos
        </Link>
      </div>
    </div>
  )
}

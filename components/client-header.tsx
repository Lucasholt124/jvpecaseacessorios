"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import CartDropdown from "@/components/cart-dropdown"
import { Search, Menu, X, User, Heart, Phone, MapPin, Clock, LogOut, Package, Truck } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import MobileMenu from "./mobile-menu"



interface Props {
  user: {
    id: string
    email: string
    name: string
    role: string
  } | null
  onLogout?: () => void
}

export default function ClientHeader({ user, onLogout }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      document.body.style.overflow = prev ? "" : "hidden"
      return !prev
    })
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    document.body.style.overflow = ""
  }, [])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
        setIsMenuOpen(false)
      }
    },
    [searchQuery, router]
  )

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        if (onLogout) onLogout()
        router.push("/")
      } else {
        alert("Erro ao fazer logout. Tente novamente.")
      }
    } catch {
      alert("Erro na conexão. Tente novamente.")
    }
  }

  return (
    <header
      aria-label="Cabeçalho principal do site"
      role="banner"
      className={`sticky top-0 z-50 bg-yellow-500 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* Top Bar */}
      <div className="bg-blue-600 text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex flex-col md:flex-row justify-between gap-2 items-center">
          <div className="flex flex-wrap items-center gap-6">
            <a href="tel:+5579996828167" className="flex items-center gap-2 hover:underline">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>(79) 99682-8167</span>
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span>Entregamos em todo Brasil</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Seg-Dom: 7h às 23h</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Frete GRÁTIS acima de R$ 100</span>
            <Badge variant="secondary" className="bg-yellow-400 text-black font-semibold uppercase">
              PROMOÇÃO
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
<Link
  href="/"  // Quando o usuário clicar, vai para a página inicial
  className="flex items-center gap-3 flex-shrink-0" // estilo flexível com espaçamento e evita encolher
  aria-label="Página inicial JVPECASEACESSORIOS" // acessibilidade: descreve o link para leitores de tela
>
  {/* Caixa do ícone */}
  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
    {/* Ícone do caminhão */}
    <Truck className="text-white" size={24} />
  </div>

  {/* Texto do logo (escondido em telas pequenas) */}
  <div className="hidden sm:block">
    <h1 className="font-bold text-xl text-gray-900">JVPECASEACESSORIOS</h1>
    <p className="text-xs text-gray-600">Peças e Acessórios</p>
  </div>
</Link>

        {/* Busca - escondida no mobile */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 relative hidden md:block">
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-black pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-0"
            aria-label="Campo de busca de produtos"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              {/* Botão de perfil melhorado */}
              <Link
                href="/perfil"
                className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                aria-label="Meu perfil"
              >
                <User className="h-5 w-5" aria-hidden="true" />
                <span className="truncate max-w-[100px]">{user.name.split(" ")[0]}</span>
              </Link>

              {/* Botão de logout */}
              <Button
                variant="outline"
                size="sm"
                 onClick={async () => {
    await handleLogout()
    closeMenu()
  }}
                className="hidden sm:flex items-center gap-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Sair da conta"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex" aria-label="Minha conta">
              <Link href="/login" className="flex items-center gap-2">
                <User className="h-5 w-5" aria-hidden="true" />
                <span className="hidden lg:inline">Entrar</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" size="sm" asChild className="hidden sm:flex" aria-label="Meus favoritos">
            <Link href="/favoritos" className="flex items-center gap-2">
              <Heart className="h-5 w-5" aria-hidden="true" />
              <span className="hidden lg:inline">Favoritos</span>
            </Link>
          </Button>

          <CartDropdown />

          {/* Botão menu mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {/* Navigation Desktop */}
      <nav className="border-t bg-gray-50 hidden md:block" aria-label="Navegação principal">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              <Link
                href="/produtos"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Todos os Produtos
              </Link>
              <Link
                href="/categorias"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Categorias
              </Link>
              <Link
                href="/promocoes"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Promoções
              </Link>
              <Link
                href="/contato"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contato
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <span role="img" aria-label="Checkmark">
                  ✓
                </span>{" "}
                Compra Segura
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <span role="img" aria-label="Checkmark">
                  ✓
                </span>{" "}
                Entrega Rápida
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
  isOpen={isMenuOpen}
  onClose={closeMenu}
  onSearch={(query) => {
    router.push(`/busca?q=${encodeURIComponent(query)}`)
  }}
  user={user}
  onLogout={handleLogout}
/>
    </header>
  )
}

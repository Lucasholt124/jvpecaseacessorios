"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import CartDropdown from "@/components/cart-dropdown"
import { Search, Menu, X, User, Heart, Phone, MapPin, Clock, LogOut } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"

interface Props {
  user: {
    id: string
    email: string
    name: string
    role: string
  } | null
  onLogout?: () => void // callback opcional para atualizar estado no pai
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

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    document.body.style.overflow = ""
  }, [])

  // Função logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      const data = await response.json()
      if (data.success) {
        if (onLogout) onLogout() // notificar componente pai para atualizar estado user
        router.push("/") // redirecionar para home
      } else {
        alert("Erro ao fazer logout. Tente novamente.")
      }
    } catch (error) {
      alert("Erro na conexão. Tente novamente.")
    }
  }

  return (
    <header
      aria-label="Cabeçalho principal do site"
      role="banner"
      className={`sticky top-0 z-50 bg-yellow-500 transition-all duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      {/* Top Bar */}
      <div className="bg-blue-600 text-white text-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center gap-6">
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
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0"
            aria-label="Página inicial JVPECASEACESSORIOS"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JV</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-xl text-gray-900">JVPECASEACESSORIOS</h1>
              <p className="text-xs text-gray-600">Peças e Acessórios</p>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 relative hidden md:block">
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
              aria-label="Campo de busca de produtos"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <>
                <span className="hidden sm:flex items-center gap-2 text-gray-700 text-sm">
                  Olá, {user.name.split(" ")[0]}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                  onClick={handleLogout}
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
      </div>

      {/* Navigation Desktop */}
      <nav className="border-t bg-gray-50 hidden md:block" aria-label="Navegação principal">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              <Link href="/produtos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Todos os Produtos
              </Link>
              <Link href="/categorias" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Categorias
              </Link>
              <Link href="/promocoes" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Promoções
              </Link>
              <Link href="/contato" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
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
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-[var(--header-height, 0px)] bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        >
          <div
            className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-lg py-4 animate-slideInLeft"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação mobile"
          >
            <div className="container mx-auto px-4 space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
                  aria-label="Campo de busca de produtos no menu mobile"
                />
                <Button type="submit" aria-label="Buscar no menu mobile">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </Button>
              </form>

              <Link
                href="/produtos"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={closeMenu}
              >
                Todos os Produtos
              </Link>
              <Link
                href="/categorias"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={closeMenu}
              >
                Categorias
              </Link>
              <Link
                href="/promocoes"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={closeMenu}
              >
                Promoções
              </Link>
              <Link
                href="/contato"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={closeMenu}
              >
                Contato
              </Link>
              <div className="border-t pt-4 space-y-2">
                {user ? (
                  <>
                    <span className="block py-2 text-gray-700">Olá, {user.name.split(" ")[0]}</span>
                    <button
                      onClick={() => {
                        handleLogout()
                        closeMenu()
                      }}
                      className="w-full text-left py-2 text-red-600 hover:underline"
                      aria-label="Sair da conta"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="block py-2 text-gray-700 hover:text-blue-600" onClick={closeMenu}>
                    Entrar / Cadastrar
                  </Link>
                )}
                <Link href="/favoritos" className="block py-2 text-gray-700 hover:text-blue-600" onClick={closeMenu}>
                  Meus Favoritos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

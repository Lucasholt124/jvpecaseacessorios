import HeroCarousel from "@/components/hero-carousel"
import FeaturedCategories from "@/components/featured-categories"
import FeaturedProducts from "@/components/featured-products"
import NewsletterSignup from "@/components/newsletter-signup"
import { Suspense } from "react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <Suspense fallback={<div className="h-[600px] bg-gray-100 animate-pulse" />}>
        <HeroCarousel />
      </Suspense>

      {/* Categorias em Destaque */}
      <Suspense fallback={<div className="h-64 bg-gray-50" />}>
        <FeaturedCategories />
      </Suspense>

      {/* Produtos em Destaque */}
      <Suspense fallback={<div className="h-96 bg-white" />}>
        <FeaturedProducts />
      </Suspense>

      {/* Seção de Benefícios */}
      <section
        aria-labelledby="why-choose-title"
        className="py-16 bg-gradient-to-r from-blue-50 to-purple-50"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                id="why-choose-title"
                className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
              >
                Por que escolher a JVPECASEACESSORIOS?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Oferecemos a melhor experiência de compra com qualidade garantida
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span role="img" aria-label="Entrega Rápida" className="text-3xl">
                    🚚
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Entrega Rápida</h3>
                <p className="text-gray-600 leading-relaxed">
                  Frete grátis acima de R$ 100 e entrega expressa para todo o Brasil
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span role="img" aria-label="Compra Segura" className="text-3xl">
                    🔒
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Compra Segura</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pagamento 100% protegido com as melhores tecnologias de segurança
                </p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span role="img" aria-label="Qualidade Garantida" className="text-3xl">
                    ⭐
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Qualidade Garantida</h3>
                <p className="text-gray-600 leading-relaxed">
                  Produtos selecionados com garantia e suporte especializado
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Suspense fallback={<div className="h-32 bg-yellow-500" />}>
        <NewsletterSignup />
      </Suspense>

      {/* Sobre a Empresa */}
      <section aria-labelledby="about-us-title" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 id="about-us-title" className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              JVPECASEACESSORIOS
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Há anos no mercado, oferecemos peças e acessórios de alta qualidade para atender todas as suas
              necessidades. Nossa missão é proporcionar a melhor experiência de compra com produtos confiáveis e
              atendimento excepcional.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
                <p className="text-gray-600">Anos de Experiência</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">1000+</div>
                <p className="text-gray-600">Produtos Disponíveis</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
                <p className="text-gray-600">Clientes Satisfeitos</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

import React from "react";
import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="bg-yellow-500 text-white"
      aria-labelledby="footer-heading"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-12">
        <h2 id="footer-heading" className="sr-only">
          Informações de Rodapé da JVPECASEACESSORIOS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <nav aria-labelledby="about-heading">
            <h3 id="about-heading" className="font-bold text-xl mb-4">
              JVPECASEACESSORIOS
            </h3>
            <p className="text-white-500 mb-4 text-sm">
              Especialistas em peças e acessórios automotivos. Qualidade garantida e os melhores preços do mercado para seu veículo.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://www.instagram.com/jv_pecas_acessorios?igsh=MWlwcGUzbnN0NWd1cg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-black transition-colors"
                aria-label="Facebook da JVPECASEACESSORIOS"
              >
                <Facebook className="w-6 h-6" aria-hidden="true" />
              </Link>
              <Link
                href="https://www.instagram.com/jv_pecas_acessorios?igsh=MWlwcGUzbnN0NWd1cg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-black transition-colors"
                aria-label="Instagram da JVPECASEACESSORIOS"
              >
                <Instagram className="w-6 h-6" aria-hidden="true" />
              </Link>
            </div>
          </nav>

          <nav aria-labelledby="quicklinks-heading">
            <h4 id="quicklinks-heading" className="font-semibold text-lg mb-4">
              Links Rápidos
            </h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/produtos" className="hover:text-black transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="hover:text-black transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link href="/promocoes" className="hover:text-black transition-colors">
                  Ofertas
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="support-heading">
            <h4 id="support-heading" className="font-semibold text-lg mb-4">
              Atendimento
            </h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <Link href="/contato" className="hover:text-black transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-black transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/meus-pedidos" className="hover:text-black transition-colors">
                  Rastrear Pedido
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h4 className="font-semibold text-lg mb-4">Entre em Contato</h4>
            <address className="not-italic space-y-3 text-gray-300 text-sm">
              <a href="tel:+5579996828167" className="flex items-center hover:text-black transition-colors">
                <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>(79) 99682-8167</span>
              </a>
              <a href="Jvpecas2003@bol.com.br" className="flex items-center hover:text-black transition-colors">
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Jvpecas2003@bol.com.br</span>
              </a>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Ribeirópolis-SE - Brasil</span>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-200 text-xs">
          <p>
            &copy; {currentYear} JVPECASEACESSORIOS. Todos os direitos reservados.
          </p>
          <p className="mt-2">
            Feito e desenvolvido por{" "}
            <a
  href="https://mysite-eog7.vercel.app/"
  target="_blank"
  rel="noopener noreferrer"
  className="font-semibold text-purple-500 hover:text-black-400 hover:underline hover:scale-105 transition-all inline-flex items-center gap-1"
>
  Impulsioneweb
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0 0L10 21l-4-4L21 10z" />
  </svg>
</a>

          </p>
        </div>
      </div>
    </footer>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import LiveChat from "@/components/live-chat"
import ProductComparison from "@/components/product-comparison"
import { Toaster } from "@/components/ui/toaster"
import { getSiteSettings } from "@/lib/sanity"

const inter = Inter({ subsets: ["latin"] })

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    title: settings?.title || "JVPECASEACESSORIOS - Peças e Acessórios Automotivos",
    description:
      settings?.description ||
      "Loja especializada em peças e acessórios automotivos com os melhores preços e qualidade garantida.",
    keywords: settings?.keywords || "peças automotivas, acessórios, carros, motos, qualidade, preço baixo",
    authors: [{ name: "JVPECASEACESSORIOS" }],
    creator: "JVPECASEACESSORIOS",
    publisher: "JVPECASEACESSORIOS",
    robots: "index, follow",
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      siteName: "JVPECASEACESSORIOS",
      title: settings?.title || "JVPECASEACESSORIOS",
      description: settings?.description || "Peças e acessórios automotivos de qualidade",
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.title || "JVPECASEACESSORIOS",
      description: settings?.description || "Peças e acessórios automotivos de qualidade",
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        {/* Componentes Globais */}
        <LiveChat />
        <ProductComparison />
        <Toaster />

        {/* PWA Service Worker script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

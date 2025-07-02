import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <CardTitle className="text-2xl">Página não encontrada</CardTitle>
          <CardDescription>A página que você está procurando não existe ou foi movida.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/busca">
              <Search className="w-4 h-4 mr-2" />
              Buscar Produtos
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

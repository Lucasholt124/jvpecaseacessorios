import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Calendar,
  Package,
  Heart,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"

export default async function PerfilPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Dados simulados (em produção viriam do banco)
  const userStats = {
    totalOrders: 12,
    totalSpent: 1299.9,
    favoriteProducts: 8,
    memberSince: "2023-06-15",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-gray-600">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações do Usuário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Nome
                  </label>
                  <p className="text-lg font-semibold">
                    {user.name || "Não informado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Informações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Suas Estatísticas</CardTitle>
              <CardDescription>Resumo da sua atividade na loja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {userStats.totalOrders}
                  </p>
                  <p className="text-sm text-gray-600">Pedidos</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl mb-2 block">💰</span>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {userStats.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total Gasto</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {userStats.favoriteProducts}
                  </p>
                  <p className="text-sm text-gray-600">Favoritos</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-purple-600">
                    {new Date(userStats.memberSince).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-600">Membro desde</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereços */}
          <Card>
            <CardHeader>
              <CardTitle>Endereços Salvos</CardTitle>
              <CardDescription>Gerencie seus endereços de entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum endereço salvo</p>
                <Button variant="outline">Adicionar Endereço</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Lateral */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/meus-pedidos" className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  Meus Pedidos
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/favoritos" className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Lista de Desejos
                </Link>
              </Button>

              <Button variant="ghost" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>

              <Button variant="ghost" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Suporte
              </Button>

              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full justify-start">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status da Conta */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Status da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verificado</span>
                  <Badge className="bg-green-100 text-green-800">Verificado</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Newsletter</span>
                  <Badge variant="secondary">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Tipo de Conta</span>
                  <Badge variant="outline">Cliente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

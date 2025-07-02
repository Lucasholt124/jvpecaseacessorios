import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Calendar, CreditCard, Truck, Eye } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

interface OrderItem {
  id: string
  productName: string
  quantity: number
  price: number
}

interface Order {
  id: string
  createdAt: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  paymentMethod: string
  items: OrderItem[]
  tracking?: string | null
}

function getStatusInfo(status: Order["status"]) {
  const statusMap = {
    processing: { label: "Processando", color: "bg-yellow-100 text-yellow-800", icon: Package },
    shipped: { label: "Enviado", color: "bg-blue-100 text-blue-800", icon: Truck },
    delivered: { label: "Entregue", color: "bg-green-100 text-green-800", icon: Package },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: Package },
  }
  return statusMap[status] || statusMap.processing
}

// ... imports e interfaces iguais

export default async function MeusPedidosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          quantity: true,
          price: true,
        },
      },
    },
  })

  const normalizeStatus = (status: string): "processing" | "shipped" | "delivered" | "cancelled" => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
      case "PROCESSING":
        return "processing"
      case "SHIPPED":
        return "shipped"
      case "DELIVERED":
        return "delivered"
      case "CANCELLED":
        return "cancelled"
      default:
        return "processing"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Pedidos</h1>
        <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600 mb-6">Você ainda não fez nenhum pedido</p>
            <Button asChild>
              <Link href="/produtos">Começar a Comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(normalizeStatus(order.status))
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* REMOVIDO rastreamento pois não existe */}

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/pedido/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    {normalizeStatus(order.status) === "delivered" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/pedido/${order.id}/avaliar`}>Avaliar Produtos</Link>
                      </Button>
                    )}
                    {normalizeStatus(order.status) === "processing" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => alert(`Cancelar pedido ${order.id} - implemente a ação aqui`)}
                      >
                        Cancelar Pedido
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

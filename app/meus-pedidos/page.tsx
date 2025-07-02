import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Calendar, CreditCard, Truck, Eye } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  date: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  paymentMethod: string
  items: OrderItem[]
  tracking?: string
}

// Simulação de pedidos (em produção viria do banco de dados)
const mockOrders: Order[] = [
  {
    id: "order_1234567890",
    date: "2024-01-15",
    status: "delivered",
    total: 299.9,
    paymentMethod: "PIX",
    items: [
      { name: "Filtro de Ar Esportivo", quantity: 1, price: 89.9 },
      { name: "Óleo Motor 5W30", quantity: 2, price: 105.0 },
    ],
    tracking: "BR123456789",
  },
  {
    id: "order_0987654321",
    date: "2024-01-20",
    status: "shipped",
    total: 159.9,
    paymentMethod: "Cartão de Crédito",
    items: [{ name: "Pastilha de Freio Dianteira", quantity: 1, price: 159.9 }],
    tracking: "BR987654321",
  },
  {
    id: "order_1122334455",
    date: "2024-01-22",
    status: "processing",
    total: 89.9,
    paymentMethod: "PIX",
    items: [{ name: "Lâmpada LED H7", quantity: 2, price: 44.95 }],
  },
]

function getStatusInfo(status: Order["status"]) {
  const statusMap = {
    processing: { label: "Processando", color: "bg-yellow-100 text-yellow-800", icon: Package },
    shipped: { label: "Enviado", color: "bg-blue-100 text-blue-800", icon: Truck },
    delivered: { label: "Entregue", color: "bg-green-100 text-green-800", icon: Package },
    cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: Package },
  }
  return statusMap[status] || statusMap.processing
}

export default async function MeusPedidosPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Pedidos</h1>
        <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
      </div>

      {mockOrders.length === 0 ? (
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
          {mockOrders.map((order: Order) => {
            const statusInfo = getStatusInfo(order.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.date).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Itens do Pedido */}
                  <div>
                    <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {order.items.map((item: OrderItem, index: number) => (
                        <div
                          key={index}
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

                  {/* Informações de Pagamento */}
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

                  {/* Rastreamento */}
                  {order.tracking && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-800">Código de Rastreamento</p>
                          <p className="text-blue-600 font-mono">{order.tracking}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Truck className="w-4 h-4 mr-2" />
                          Rastrear
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/pedido/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </Button>
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        Avaliar Produtos
                      </Button>
                    )}
                    {order.status === "processing" && (
                      <Button variant="destructive" size="sm">
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

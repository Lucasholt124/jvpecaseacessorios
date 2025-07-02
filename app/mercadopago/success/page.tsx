import { Suspense } from "react"
import { CheckCircle, Package, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SuccessPageProps {
  searchParams: {
    payment_id?: string
    status?: string
    external_reference?: string
    merchant_order_id?: string
  }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">Pagamento Aprovado!</CardTitle>
          <CardDescription>Seu pedido foi processado com sucesso</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Suspense fallback={<div>Carregando detalhes...</div>}>
            <PaymentDetails searchParams={searchParams} />
          </Suspense>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Próximos Passos</p>
                <p className="text-sm text-blue-600">Você receberá um email com os detalhes do pedido</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Pagamento</p>
                <p className="text-sm text-green-600">Processado com segurança pelo Mercado Pago</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href="/products">Continuar Comprando</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/orders">Meus Pedidos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentDetails({ searchParams }: { searchParams: any }) {
  const { payment_id, status, external_reference } = searchParams

  return (
    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-gray-800">Detalhes do Pagamento</h3>

      {payment_id && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ID do Pagamento:</span>
          <span className="font-mono">{payment_id}</span>
        </div>
      )}

      {status && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className="capitalize font-medium text-green-600">{status}</span>
        </div>
      )}

      {external_reference && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Referência:</span>
          <span className="font-mono">{external_reference}</span>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Data:</span>
        <span>{new Date().toLocaleDateString("pt-BR")}</span>
      </div>
    </div>
  )
}

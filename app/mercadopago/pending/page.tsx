import { Clock, Mail, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PendingPageProps {
  searchParams: {
    payment_id?: string
    status?: string
    external_reference?: string
  }
}

export default function PendingPage({ searchParams }: PendingPageProps) {
  const { payment_id, status, external_reference } = searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-800">Pagamento Pendente</CardTitle>
          <CardDescription>Seu pagamento está sendo processado</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {payment_id && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Detalhes</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Pagamento:</span>
                  <span className="font-mono">{payment_id}</span>
                </div>
                {status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="capitalize text-yellow-600">{status}</span>
                  </div>
                )}
                {external_reference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referência:</span>
                    <span className="font-mono">{external_reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Acompanhe por Email</p>
                <p className="text-sm text-blue-600">Você receberá atualizações sobre o status</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <CreditCard className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Tempo de Processamento</p>
                <p className="text-sm text-yellow-600">Pode levar até 2 dias úteis</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href="/orders">Acompanhar Pedido</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/products">Continuar Comprando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

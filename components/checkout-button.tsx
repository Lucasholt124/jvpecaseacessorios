"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface CheckoutButtonProps {
  userEmail: string
  userName?: string
  userPhone?: {
    area_code: string
    number: string
  }
  disabled?: boolean
}

export default function CheckoutButton({
  userEmail,
  userName,
  userPhone,
  disabled,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    if (!userEmail) {
      toast.error("E-mail do usuário é obrigatório.")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name: userName,
          phone: userPhone,
        }),
      })

      if (!res.ok) throw new Error("Erro ao criar preferência de pagamento")

      const data: {
        initPoint?: string
        sandboxInitPoint?: string
      } = await res.json()

      const isProd = process.env.NODE_ENV === "production"
      const redirectUrl = isProd ? data.initPoint : data.sandboxInitPoint

      if (!redirectUrl) {
        throw new Error("A URL de pagamento está ausente na resposta.")
      }

      // Verificação de segurança contra Open Redirect
      const allowedDomains = ["https://www.mercadopago.com", "https://sandbox.mercadopago.com"]
      const isValidRedirect = allowedDomains.some((domain) =>
        redirectUrl.startsWith(domain)
      )

      if (!isValidRedirect) {
        throw new Error("Redirecionamento bloqueado: URL de destino não permitida.")
      }

      window.location.href = redirectUrl
    } catch (err: any) {
      console.error("Erro no checkout:", err)
      toast.error(err?.message || "Não foi possível iniciar o pagamento.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processando...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          Finalizar Compra
        </>
      )}
    </Button>
  )
}

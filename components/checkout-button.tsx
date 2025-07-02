"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"

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
      alert("E-mail do usuário é obrigatório.")
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

      const { initPoint, sandboxInitPoint } = await res.json()

      const isProd = process.env.NODE_ENV === "production"
      const redirectUrl = isProd ? initPoint : sandboxInitPoint

      window.location.href = redirectUrl
    } catch (err) {
      console.error("Erro no checkout:", err)
      alert("Não foi possível iniciar o pagamento. Tente novamente.")
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

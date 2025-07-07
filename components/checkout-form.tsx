"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CreditCard, MapPin, User } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useSyncCartFromCookie } from "@/hooks/useSyncCart"

interface CheckoutFormProps {
  cartTotal: number
  cartItems: number
}

interface CustomerData {
  email: string
  name: string
  phone: {
    area_code: string
    number: string
  }
  address: {
    zip_code: string
    street_name: string
    street_number: string
    neighborhood: string
    city: string
    state: string
    complement?: string
  }
}

export default function CheckoutForm({ cartTotal, cartItems }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData>({
    email: "",
    name: "",
    phone: { area_code: "", number: "" },
    address: {
      zip_code: "",
      street_name: "",
      street_number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
    },
  })

  const router = useRouter()
  const [loadingCart, setLoadingCart] = useState(true)
  const items = useCartStore((s) => s.items)

  useEffect(() => {
    const sync = async () => {
      await useSyncCartFromCookie()
      setLoadingCart(false)
    }
    sync()
  }, [])

  useEffect(() => {
    if (!loadingCart && items.length === 0) {
      router.push("/cart")
    }
  }, [loadingCart, items, router])

  const handleInputChange = (field: string, value: string, nested?: string) => {
    setCustomerData((prev) => {
      if (nested) {
        return {
          ...prev,
          [nested]: {
            ...(prev[nested as keyof CustomerData] as object),
            [field]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const handleCEPChange = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "")
    handleInputChange("zip_code", cleanCEP, "address")

    if (cleanCEP.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()

        if (!data.erro) {
          setCustomerData((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              street_name: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf,
            },
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
        toast.error("Não foi possível buscar o endereço")
      }
    }
  }

  const validateStep1 = () => {
    const { name, email, phone } = customerData
    return name && email && phone.area_code && phone.number
  }

  const validateStep2 = () => {
    const a = customerData.address
    return a.zip_code && a.street_name && a.street_number && a.neighborhood && a.city && a.state
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return toast.error("Preencha todos os campos obrigatórios")

    setIsLoading(true)
    try {
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(customerData),
      })

      if (!response.ok) throw new Error("Erro ao processar checkout")

      const { initPoint, sandboxInitPoint } = await response.json()
      const isProd = process.env.NODE_ENV === "production"
      const checkoutUrl = isProd ? initPoint : sandboxInitPoint

      const allowedDomains = [
        "https://www.mercadopago.com",
        "https://www.mercadopago.com.br",
        "https://sandbox.mercadopago.com",
      ]
      const isValid = allowedDomains.some((domain) => checkoutUrl?.startsWith(domain))
      if (!isValid) throw new Error("URL de redirecionamento inválida.")

      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error("Erro no checkout:", error)
      toast.error(error?.message || "Erro ao processar pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingCart || items.length === 0) {
    return <div className="text-center py-20 text-gray-500">Carregando...</div>
  }


  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Finalizar Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Indicador de Etapa */}
                <div className="text-sm font-medium text-gray-600">Etapa {step} de 2</div>

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4" />
                        <h3 className="font-semibold">Dados Pessoais</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input id="name" value={customerData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Seu nome completo" required />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" type="email" value={customerData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="seu@email.com" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="area_code">DDD *</Label>
                          <Input id="area_code" value={customerData.phone.area_code} onChange={(e) => handleInputChange("area_code", e.target.value, "phone")} placeholder="11" maxLength={2} required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input id="phone" value={customerData.phone.number} onChange={(e) => handleInputChange("number", e.target.value, "phone")} placeholder="999999999" required />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4" />
                        <h3 className="font-semibold">Endereço de Entrega</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <Input id="cep" value={customerData.address.zip_code} onChange={(e) => handleCEPChange(e.target.value)} placeholder="00000-000" maxLength={9} required />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="street">Rua *</Label>
                          <Input id="street" value={customerData.address.street_name} onChange={(e) => handleInputChange("street_name", e.target.value, "address")} placeholder="Nome da rua" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="number">Número *</Label>
                          <Input id="number" value={customerData.address.street_number} onChange={(e) => handleInputChange("street_number", e.target.value, "address")} placeholder="123" required />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input id="complement" value={customerData.address.complement} onChange={(e) => handleInputChange("complement", e.target.value, "address")} placeholder="Apto, bloco, etc." />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="neighborhood">Bairro *</Label>
                          <Input id="neighborhood" value={customerData.address.neighborhood} onChange={(e) => handleInputChange("neighborhood", e.target.value, "address")} placeholder="Bairro" required />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade *</Label>
                          <Input id="city" value={customerData.address.city} onChange={(e) => handleInputChange("city", e.target.value, "address")} placeholder="Cidade" required />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado *</Label>
                          <Select value={customerData.address.state} onValueChange={(value) => handleInputChange("state", value, "address")}> <SelectTrigger> <SelectValue placeholder="UF" /> </SelectTrigger>
                            <SelectContent>
                              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between gap-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                      Voltar
                    </Button>
                  )}
                  {step < 2 ? (
                    <Button type="button" onClick={() => {
                      if (validateStep1()) setStep(step + 1);
                      else toast.error("Preencha todos os campos obrigatórios");
                    }}>
                      Próximo
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>) : (<><CreditCard className="w-4 h-4 mr-2" />Ir para Pagamento</>)}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Pedido */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems} itens)</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>R$ 10,00</span>
                </div>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {(cartTotal + 10).toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Parcelamento até 12x</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>PIX com desconto</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

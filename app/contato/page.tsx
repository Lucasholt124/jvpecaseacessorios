"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react"

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo ou envie uma mensagem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações de Contato */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
              <CardDescription>Fale conosco através dos canais abaixo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-gray-600">(79) 99682-8167</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">Jvpecas2003@bol.com.br</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-gray-600">Ribeirópolis-SE</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Horário</p>
                  <p className="text-gray-600">Seg-Dom: 7h às 23h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp */}
         <Card className="border-green-200 bg-gradient-to-br from-green-50 via-white to-green-100 shadow-sm">
  <CardContent className="p-6 text-center space-y-4">
    <div className="w-14 h-14 mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        className="text-green-600"
      >
        <path d="M16 0C7.164 0 0 7.162 0 16c0 2.812.738 5.445 2.039 7.773L0 32l8.438-2.191A15.85 15.85 0 0 0 16 32c8.836 0 16-7.164 16-16S24.836 0 16 0Zm0 29.25a13.2 13.2 0 0 1-6.758-1.828l-.484-.285-5.008 1.301 1.332-4.875-.313-.5A13.221 13.221 0 0 1 2.75 16c0-7.32 5.93-13.25 13.25-13.25S29.25 8.68 29.25 16 23.32 29.25 16 29.25Zm7.469-9.617c-.41-.207-2.43-1.199-2.812-1.336-.383-.137-.664-.207-.945.207-.277.41-1.09 1.336-1.336 1.613-.246.273-.492.305-.902.098-.41-.207-1.734-.637-3.305-2.027-1.219-1.09-2.043-2.43-2.285-2.844-.238-.41-.027-.629.18-.84.184-.184.41-.48.614-.719.207-.242.27-.414.41-.68.137-.273.07-.512-.035-.719-.098-.207-.945-2.281-1.293-3.125-.34-.82-.688-.707-.945-.723-.242-.012-.512-.016-.785-.016-.273 0-.715.102-1.09.512-.375.41-1.43 1.395-1.43 3.406 0 2.012 1.465 3.957 1.668 4.227.207.273 2.875 4.395 6.973 6.18 4.102 1.785 4.102 1.188 4.84 1.113.742-.07 2.43-.988 2.77-1.949.34-.961.34-1.785.238-1.949-.102-.164-.375-.27-.785-.48Z"/>
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-green-800">Atendimento via WhatsApp</h3>
    <p className="text-green-700 text-sm">
      Resposta rápida e atendimento personalizado direto pelo WhatsApp
    </p>
    <Button
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
      asChild
    >
      <a
        href="https://wa.me/5579996828167"
        target="_blank"
        rel="noopener noreferrer"
      >
        Falar no WhatsApp
      </a>
    </Button>
  </CardContent>
</Card>

        </div>

        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Envie uma Mensagem</CardTitle>
              <CardDescription>Preencha o formulário abaixo e entraremos em contato em breve</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <Send className="w-4 h-4" />
                  <AlertDescription className="text-green-800">
                    Mensagem enviada com sucesso! Entraremos em contato em breve.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(79) 99682-8167"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto *</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleChange("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="duvida">Dúvida sobre produto</SelectItem>
                        <SelectItem value="pedido">Problema com pedido</SelectItem>
                        <SelectItem value="troca">Troca/Devolução</SelectItem>
                        <SelectItem value="sugestao">Sugestão</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    required
                    placeholder="Descreva sua dúvida ou solicitação..."
                    rows={5}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como faço para rastrear meu pedido?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Após o envio, você receberá um código de rastreamento por email. Também pode acompanhar na seção "Meus
                Pedidos".
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Qual o prazo de entrega?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                O prazo varia de 5 a 10 dias úteis, dependendo da sua localização. Frete grátis para pedidos acima de R$
                100.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posso trocar um produto?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sim! Você tem até 7 dias para solicitar a troca, desde que o produto esteja em perfeitas condições.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quais formas de pagamento aceitas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aceitamos PIX, cartões de crédito/débito, boleto bancário e parcelamento em até 12x sem juros.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

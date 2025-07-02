"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { subscribeNewsletter } from "@/lib/newsletter"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const result = await subscribeNewsletter(email.trim())

      if (result.success) {
        setIsSuccess(true)
        setMessage(result.message || "Cadastro realizado com sucesso!")
        setEmail("")
      } else {
        setIsSuccess(false)
        setMessage(result.error || "Erro ao cadastrar")
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage("Erro interno do servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-yellow-500">
      <form onSubmit={handleSubmit} className="flex gap-2 bg-yellow-500" aria-live="polite" aria-busy={loading}>
        <Input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-yellow-500"
          aria-label="Email para cadastro na newsletter"
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>

      {message && (
        <Alert
          className={`mt-4 ${isSuccess ? "border-green-500" : ""}`}
          variant={isSuccess ? "default" : "destructive"}
          role="alert"
        >
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

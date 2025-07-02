"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NovoEnderecoPage() {
  const router = useRouter()
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/perfil/enderecos/novo", {
        method: "POST",
        body: JSON.stringify({ street, number, city, state, zipCode }),
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        alert("Endereço adicionado!")
        router.push("/perfil")
      } else {
        alert("Erro ao adicionar endereço")
      }
    } catch {
      alert("Erro ao adicionar endereço")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Adicionar Novo Endereço</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Rua"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Número"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Cidade"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="Estado"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="CEP"
          required
          className="w-full border rounded px-3 py-2"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Endereço"}
        </Button>
      </form>
    </div>
  )
}

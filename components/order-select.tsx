"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderSelectProps {
  categoria?: string
  ordenar?: string
}

export default function OrderSelect({ categoria, ordenar }: OrderSelectProps) {
  return (
    <Select
      defaultValue={ordenar || "recentes"}
      onValueChange={(value) => {
        const categoriaParam = categoria ? `categoria=${categoria}&` : ""
        window.location.href = `/produtos?${categoriaParam}ordenar=${value}`
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Ordenar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recentes">Mais Recentes</SelectItem>
        <SelectItem value="preco-menor">Menor Preço</SelectItem>
        <SelectItem value="preco-maior">Maior Preço</SelectItem>
        <SelectItem value="nome">Nome A-Z</SelectItem>
      </SelectContent>
    </Select>
  )
}

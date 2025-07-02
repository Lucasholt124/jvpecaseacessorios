"use client"

import { Button } from "@/components/ui/button"

export default function BuyNowButton() {
  function handleClick() {
    alert("Comprar agora: implementação pendente")
  }

  return (
    <Button variant="secondary" size="lg" className="w-full mt-4" onClick={handleClick}>
      Comprar Agora
    </Button>
  )
}

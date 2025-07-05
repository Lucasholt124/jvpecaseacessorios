"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function useSyncCartFromCookie() {
  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "GET",
          credentials: "include", // para enviar cookies junto
        });
        if (!res.ok) throw new Error("Erro ao buscar carrinho");
        const data = await res.json();
        if (Array.isArray(data.cart)) {
          useCartStore.getState().setItems(data.cart);
        }
      } catch (error) {
        console.error("Erro ao sincronizar carrinho:", error);
      }
    };
    sync();
  }, []);
}

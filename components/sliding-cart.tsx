// "use client"

// import { useState, useEffect } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { ShoppingCart, Plus, Minus, X, Package } from "lucide-react"
// import { urlFor } from "@/lib/sanity"
// import { formatPrice } from "@/lib/utils"

// interface Product {
//   _id: string
//   name: string
//   price: number
//   stock: number
//   images?: any[]
// }

// interface CartItem {
//   product: Product
//   quantity: number
// }

// interface Toast {
//   id: number
//   message: string
//   type: "success" | "error"
// }

// const STORAGE_KEY = "my-cart"

// export default function SlidingCart() {
//   // const [cart, setCart] = useState<CartItem[]>([])
//   // const [isOpen, setIsOpen] = useState(false)
//   // const [isLoadingIds, setIsLoadingIds] = useState<Set<string>>(new Set())
//   // const [toasts, setToasts] = useState<Toast[]>([])

//   // useEffect(() => {
//   //   try {
//   //     const savedCart = localStorage.getItem(STORAGE_KEY)
//   //     if (savedCart) {
//   //       setCart(JSON.parse(savedCart))
//   //     }
//   //   } catch (err) {
//   //     console.error("Erro ao ler carrinho do localStorage:", err)
//   //   }
//   // }, [])

//   // useEffect(() => {
//   //   try {
//   //     localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
//   //   } catch (err) {
//   //     console.error("Erro ao salvar carrinho no localStorage:", err)
//   //   }
//   // }, [cart])

//   // const showToast = (message: string, type: "success" | "error") => {
//   //   const id = Date.now()
//   //   setToasts((t) => [...t, { id, message, type }])
//   //   setTimeout(() => {
//   //     setToasts((t) => t.filter((toast) => toast.id !== id))
//   //   }, 3500)
//   // }

//   // const updateQuantity = (productId: string, newQuantity: number) => { ... }
//   // const removeItem = (productId: string) => { ... }
//   // const subtotal = ...
//   // const total = ...
//   // const itemCount = ...

//   // return (
//   //   <>
//   //     ...todo o JSX...
//   //   </>
//   // )
//   return null
// }

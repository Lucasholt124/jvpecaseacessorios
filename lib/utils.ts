import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

export const formatCEP = (cep: string) => {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.replace(/(\d{5})(\d{3})/, "$1-$2")
}

export const formatPhone = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "")
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  }
  return phone
}

export const formatCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, "")
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export const generateOrderId = () => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `order_${timestamp}_${randomStr}`
}

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidCEP = (cep: string) => {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.length === 8
}

// Sistema de frete real: R$ 40 abaixo de R$ 100, grátis acima
export const calculateShipping = (subtotal: number): number => {
  return subtotal >= 100 ? 0 : 40
}

export const getShippingMessage = (subtotal: number): string => {
  if (subtotal >= 100) {
    return "Frete GRÁTIS"
  } else {
    const remaining = 100 - subtotal
    return `Faltam ${formatPrice(remaining)} para frete GRÁTIS`
  }
}

// Função para sanitizar strings
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, "")
}

// Função para validar dados de entrada
export const validateInput = (value: string, type: "email" | "phone" | "cep" | "text"): boolean => {
  switch (type) {
    case "email":
      return isValidEmail(value)
    case "phone":
      const cleanPhone = value.replace(/\D/g, "")
      return cleanPhone.length >= 10 && cleanPhone.length <= 11
    case "cep":
      return isValidCEP(value)
    case "text":
      return value.trim().length > 0
    default:
      return false
  }
}

// Função para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Função para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

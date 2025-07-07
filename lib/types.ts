export interface Product {
  _id: string
  name: string
  price: number
  image: string
  description: string
  slug: string
}

export interface CartItem {
  description: any
  id: string
  name: string
  price: number
  image: string
  slug: string
  stock: number
  quantity: number
}

export interface MercadoPagoItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  currency_id: string
  picture_url?: string
  description?: string
}

export interface PaymentData {
  items: MercadoPagoItem[]
  payer: {
    email: string
    name?: string
    phone?: {
      area_code: string
      number: string
    }
  }
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: "approved" | "all"
  payment_methods: {
    excluded_payment_methods: any[]
    excluded_payment_types: any[]
    installments: number
  }
  notification_url: string
  external_reference: string
}
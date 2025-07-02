import { Resend } from "resend"
import type { CartItem } from "./types"
import { formatPrice } from "./utils"

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderData {
  orderId: string
  customerName: string
  customerEmail: string
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  paymentId: string
  address: {
    street_name: string
    street_number: string
    neighborhood: string
    city: string
    state: string
    zip_code: string
    complement?: string
  }
  phone: {
    area_code: string
    number: string
  }
  discount?: number
  couponCode?: string
}

export async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    const emailHtml = generateOrderEmailTemplate(orderData)

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Sua Loja <noreply@sualoja.com>",
      to: [orderData.customerEmail],
      subject: `🎉 Pedido Confirmado #${orderData.orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error("❌ Erro ao enviar email:", error)
      return { success: false, error }
    }

    console.log("✅ Email de confirmação enviado:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Erro no envio de email:", error)
    return { success: false, error }
  }
}

function generateOrderEmailTemplate(orderData: OrderData): string {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${item.product.image || "/placeholder.svg?height=60&width=60"}" 
               alt="${item.product.name}"
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;">
          <div style="flex: 1;">
            <h4 style="margin: 0; color: #333; font-size: 16px; font-weight: 600;">${item.product.name}</h4>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Quantidade: ${item.quantity}</p>
            <p style="margin: 0; color: #333; font-weight: bold; font-size: 16px;">${formatPrice(item.product.price * item.quantity)}</p>
          </div>
        </div>
      </td>
    </tr>
  `,
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pedido Confirmado</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .header { padding: 20px !important; }
          .content { padding: 15px !important; }
        }
      </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
      
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 0;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🎉 Pedido Confirmado!</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Obrigado pela sua compra, ${orderData.customerName}!</p>
        </div>

        <!-- Order Info -->
        <div style="background: #f8f9fa; padding: 25px; border-left: 4px solid #28a745; margin: 0;">
          <h3 style="margin: 0 0 15px 0; color: #28a745; font-size: 20px;">📋 Informações do Pedido</h3>
          <div style="display: grid; gap: 8px;">
            <p style="margin: 0;"><strong>Número do Pedido:</strong> #${orderData.orderId}</p>
            <p style="margin: 0;"><strong>ID do Pagamento:</strong> ${orderData.paymentId}</p>
            <p style="margin: 0;"><strong>Método de Pagamento:</strong> ${orderData.paymentMethod}</p>
            <p style="margin: 0;"><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
          </div>
        </div>

        <!-- Items -->
        <div class="content" style="padding: 25px;">
          <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; margin: 0 0 20px 0; font-size: 20px;">🛍️ Itens do Pedido</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            ${itemsHtml}
          </table>
        </div>

        <!-- Totals -->
        <div class="content" style="padding: 25px; padding-top: 0;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">💰 Resumo do Pagamento</h3>
            <div style="space-y: 10px;">
              <div style="display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; font-size: 16px;">
                <span>Subtotal:</span>
                <span>${formatPrice(orderData.subtotal)}</span>
              </div>
              ${
                orderData.discount
                  ? `
                <div style="display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; color: #28a745; font-size: 16px;">
                  <span>Desconto ${orderData.couponCode ? `(${orderData.couponCode})` : ""}:</span>
                  <span>-${formatPrice(orderData.discount)}</span>
                </div>
              `
                  : ""
              }
              <div style="display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; font-size: 16px;">
                <span>Frete:</span>
                <span>${formatPrice(orderData.shipping)}</span>
              </div>
            </div>
            <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 22px; font-weight: bold; color: #28a745;">
              <span>Total:</span>
              <span>${formatPrice(orderData.total)}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="content" style="padding: 25px; padding-top: 0;">
          <div style="background: #e3f2fd; padding: 25px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 20px 0; color: #1976d2; font-size: 20px;">🚚 Endereço de Entrega</h3>
            <div style="font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0; font-weight: 600;">${orderData.customerName}</p>
              <p style="margin: 0 0 8px 0;">${orderData.address.street_name}, ${orderData.address.street_number}</p>
              ${orderData.address.complement ? `<p style="margin: 0 0 8px 0;">${orderData.address.complement}</p>` : ""}
              <p style="margin: 0 0 8px 0;">${orderData.address.neighborhood}</p>
              <p style="margin: 0 0 8px 0;">${orderData.address.city} - ${orderData.address.state}</p>
              <p style="margin: 0 0 8px 0;">CEP: ${orderData.address.zip_code}</p>
              <p style="margin: 0;">Telefone: (${orderData.phone.area_code}) ${orderData.phone.number}</p>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="content" style="padding: 25px; padding-top: 0;">
          <div style="background: #fff3cd; padding: 25px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0 0 20px 0; color: #856404; font-size: 20px;">📦 Próximos Passos</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 16px;">
              <li style="margin: 10px 0;">Seu pedido está sendo preparado para envio</li>
              <li style="margin: 10px 0;">Você receberá o código de rastreamento em breve</li>
              <li style="margin: 10px 0;">Prazo de entrega: 5-10 dias úteis</li>
              <li style="margin: 10px 0;">Em caso de dúvidas, entre em contato conosco</li>
            </ul>
          </div>
        </div>

        <!-- Support -->
        <div class="content" style="padding: 25px; padding-top: 0;">
          <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">💬 Precisa de Ajuda?</h3>
            <p style="margin: 0 0 20px 0; font-size: 16px;">Nossa equipe está pronta para ajudar!</p>
            <div style="margin: 20px 0;">
              <a href="mailto:${process.env.SUPPORT_EMAIL || "suporte@sualoja.com"}" 
                 style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 8px; font-weight: 600; font-size: 16px;">📧 Email</a>
              <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || "5511999999999"}" 
                 style="background: #25d366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 8px; font-weight: 600; font-size: 16px;">📱 WhatsApp</a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 30px; color: #666; font-size: 14px; border-top: 1px solid #eee; background: #f8f9fa;">
          <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Obrigado por escolher nossa loja! ❤️</p>
          <p style="margin: 0;">© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || "Sua Loja"}. Todos os direitos reservados.</p>
        </div>

      </div>

    </body>
    </html>
  `
}

export async function sendPaymentPendingEmail(orderData: OrderData) {
  try {
    const emailHtml = generatePendingEmailTemplate(orderData)

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Sua Loja <noreply@sualoja.com>",
      to: [orderData.customerEmail],
      subject: `⏳ Pagamento Pendente - Pedido #${orderData.orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error("❌ Erro ao enviar email pendente:", error)
      return { success: false, error }
    }

    console.log("✅ Email de pagamento pendente enviado:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Erro no envio de email pendente:", error)
    return { success: false, error }
  }
}

function generatePendingEmailTemplate(orderData: OrderData): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Pendente</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">⏳ Pagamento Pendente</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Olá, ${orderData.customerName}!</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; margin-bottom: 25px; text-align: center;">
            Seu pedido <strong>#${orderData.orderId}</strong> foi recebido, mas o pagamento ainda está sendo processado.
          </p>
          
          <div style="background: #fff3cd; padding: 25px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 20px;">📋 O que acontece agora?</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 16px;">
              <li style="margin: 10px 0;">Aguardamos a confirmação do pagamento</li>
              <li style="margin: 10px 0;">Você receberá um email assim que for aprovado</li>
              <li style="margin: 10px 0;">O prazo pode ser de até 2 dias úteis</li>
              <li style="margin: 10px 0;">Não é necessário fazer nada, apenas aguardar</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">💰 Total do Pedido</h3>
            <p style="font-size: 24px; font-weight: bold; color: #28a745; margin: 0;">${formatPrice(orderData.total)}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin: 0;">Em caso de dúvidas, entre em contato conosco:</p>
            <div style="margin: 20px 0;">
              <a href="mailto:${process.env.SUPPORT_EMAIL || "suporte@sualoja.com"}" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">📧 Email</a>
              <a href="https://wa.me/${process.env.WHATSAPP_NUMBER || "5511999999999"}" 
                 style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">📱 WhatsApp</a>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; background: #f8f9fa;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${process.env.COMPANY_NAME || "Sua Loja"}. Todos os direitos reservados.</p>
        </div>

      </div>

    </body>
    </html>
  `
}

export async function sendPaymentRejectedEmail(orderData: OrderData) {
  try {
    const emailHtml = generateRejectedEmailTemplate(orderData)

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Sua Loja <noreply@sualoja.com>",
      to: [orderData.customerEmail],
      subject: `❌ Pagamento Não Aprovado - Pedido #${orderData.orderId}`,
      html: emailHtml,
    })

    return { success: !error, data, error }
  } catch (error) {
    console.error("❌ Erro ao enviar email de pagamento rejeitado:", error)
    return { success: false, error }
  }
}

function generateRejectedEmailTemplate(orderData: OrderData): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Não Aprovado</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">❌ Pagamento Não Aprovado</h1>
          <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Olá, ${orderData.customerName}</p>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; margin-bottom: 25px; text-align: center;">
            Infelizmente, o pagamento do seu pedido <strong>#${orderData.orderId}</strong> não foi aprovado.
          </p>
          
          <div style="background: #f8d7da; padding: 25px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #721c24; font-size: 20px;">🔍 Possíveis Motivos</h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 16px; color: #721c24;">
              <li style="margin: 10px 0;">Dados do cartão incorretos</li>
              <li style="margin: 10px 0;">Limite insuficiente</li>
              <li style="margin: 10px 0;">Cartão bloqueado ou vencido</li>
              <li style="margin: 10px 0;">Problema na conexão</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 25px; background: #d1ecf1; border-radius: 8px; border-left: 4px solid #17a2b8;">
            <h3 style="margin: 0 0 15px 0; color: #0c5460;">💡 O que fazer agora?</h3>
            <p style="margin: 0 0 20px 0; color: #0c5460;">Você pode tentar novamente com outro método de pagamento</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/cart" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              🛒 Tentar Novamente
            </a>
          </div>
        </div>

      </div>

    </body>
    </html>
  `
}

import { Resend } from "resend"
import type { CartItem } from "./types"

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
}

export async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    const emailHtml = generateOrderEmailTemplate(orderData)

    const { data, error } = await resend.emails.send({
      from: "Sua Loja <noreply@sualoja.com>",
      to: [orderData.customerEmail],
      subject: `Pedido Confirmado #${orderData.orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error("Erro ao enviar email:", error)
      return { success: false, error }
    }

    console.log("Email enviado com sucesso:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Erro no envio de email:", error)
    return { success: false, error }
  }
}

function generateOrderEmailTemplate(orderData: OrderData): string {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <img src="${item.product.image}" alt="${item.product.name}" 
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
          <div>
            <h4 style="margin: 0; color: #333; font-size: 16px;">${item.product.name}</h4>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Quantidade: ${item.quantity}</p>
            <p style="margin: 0; color: #333; font-weight: bold;">R$ ${(item.product.price * item.quantity).toFixed(2)}</p>
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
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Pedido Confirmado!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Obrigado pela sua compra, ${orderData.customerName}!</p>
      </div>

      <!-- Order Info -->
      <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #28a745;">
        <h3 style="margin: 0 0 10px 0; color: #28a745;">📋 Informações do Pedido</h3>
        <p style="margin: 5px 0;"><strong>Número do Pedido:</strong> #${orderData.orderId}</p>
        <p style="margin: 5px 0;"><strong>ID do Pagamento:</strong> ${orderData.paymentId}</p>
        <p style="margin: 5px 0;"><strong>Método de Pagamento:</strong> ${orderData.paymentMethod}</p>
        <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <!-- Items -->
      <div style="margin: 20px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">🛍️ Itens do Pedido</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          ${itemsHtml}
        </table>
      </div>

      <!-- Totals -->
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #333;">💰 Resumo do Pagamento</h3>
        <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0;">
          <span>Subtotal:</span>
          <span>R$ ${orderData.subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0;">
          <span>Frete:</span>
          <span>R$ ${orderData.shipping.toFixed(2)}</span>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #28a745;">
          <span>Total:</span>
          <span>R$ ${orderData.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Delivery Address -->
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
        <h3 style="margin: 0 0 15px 0; color: #1976d2;">🚚 Endereço de Entrega</h3>
        <p style="margin: 5px 0;"><strong>${orderData.customerName}</strong></p>
        <p style="margin: 5px 0;">${orderData.address.street_name}, ${orderData.address.street_number}</p>
        ${orderData.address.complement ? `<p style="margin: 5px 0;">${orderData.address.complement}</p>` : ""}
        <p style="margin: 5px 0;">${orderData.address.neighborhood}</p>
        <p style="margin: 5px 0;">${orderData.address.city} - ${orderData.address.state}</p>
        <p style="margin: 5px 0;">CEP: ${orderData.address.zip_code}</p>
        <p style="margin: 5px 0;">Telefone: (${orderData.phone.area_code}) ${orderData.phone.number}</p>
      </div>

      <!-- Next Steps -->
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
        <h3 style="margin: 0 0 15px 0; color: #856404;">📦 Próximos Passos</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li style="margin: 8px 0;">Seu pedido está sendo preparado para envio</li>
          <li style="margin: 8px 0;">Você receberá o código de rastreamento em breve</li>
          <li style="margin: 8px 0;">Prazo de entrega: 5-10 dias úteis</li>
          <li style="margin: 8px 0;">Em caso de dúvidas, entre em contato conosco</li>
        </ul>
      </div>

      <!-- Support -->
      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #333; margin: 0 0 15px 0;">💬 Precisa de Ajuda?</h3>
        <p style="margin: 10px 0;">Nossa equipe está pronta para ajudar!</p>
        <div style="margin: 15px 0;">
          <a href="mailto:suporte@sualoja.com" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">📧 Email</a>
          <a href="https://wa.me/5511999999999" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 5px;">📱 WhatsApp</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee;">
        <p style="margin: 0;">Obrigado por escolher nossa loja! ❤️</p>
        <p style="margin: 10px 0 0 0;">© 2024 Sua Loja. Todos os direitos reservados.</p>
      </div>

    </body>
    </html>
  `
}

export async function sendPaymentPendingEmail(orderData: OrderData) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Pendente</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">⏳ Pagamento Pendente</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Olá, ${orderData.customerName}!</p>
        </div>

        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; margin-bottom: 20px;">Seu pedido <strong>#${orderData.orderId}</strong> foi recebido, mas o pagamento ainda está sendo processado.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">📋 O que acontece agora?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Aguardamos a confirmação do pagamento</li>
              <li style="margin: 8px 0;">Você receberá um email assim que for aprovado</li>
              <li style="margin: 8px 0;">O prazo pode ser de até 2 dias úteis</li>
            </ul>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <strong>Total do Pedido: R$ ${orderData.total.toFixed(2)}</strong>
          </p>
        </div>

      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: "Sua Loja <noreply@sualoja.com>",
      to: [orderData.customerEmail],
      subject: `Pagamento Pendente - Pedido #${orderData.orderId}`,
      html: emailHtml,
    })

    return { success: !error, data, error }
  } catch (error) {
    console.error("Erro ao enviar email de pagamento pendente:", error)
    return { success: false, error }
  }
}

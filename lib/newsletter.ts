"use server"

import { prisma } from "./prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function subscribeNewsletter(email: string, name?: string) {
  try {
    if (!email?.trim()) {
      return { success: false, error: "Email é obrigatório" }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return { success: false, error: "Email inválido" }
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.newsletter.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      if (existing.isActive) {
        return { success: false, error: "Este e-mail já está cadastrado." }
      } else {
        await prisma.newsletter.update({
          where: { email: normalizedEmail },
          data: { isActive: true },
        })
      }
    } else {
      await prisma.newsletter.create({
        data: { email: normalizedEmail },
      })
    }

    if (process.env.RESEND_API_KEY) {
      await sendWelcomeEmail(normalizedEmail, name)
    }

    return { success: true, message: "Inscrição realizada com sucesso!" }
  } catch (error) {
    console.error("❌ Erro ao cadastrar na newsletter:", error)
    return { success: false, error: "Erro interno ao tentar cadastrar. Tente novamente mais tarde." }
  }
}

async function sendWelcomeEmail(email: string, name?: string) {
  try {
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Sends a welcome email to the given email address.
   * @param {string} email - The email address to send the welcome email to.
   */
/*******  43022012-24f4-4b43-96e6-0a1152fc7733  *******/    await resend.emails.send({
      from: process.env.EMAIL_FROM || "JVPECASEACESSORIOS <noreply@jvpecaseacessorios.com>",
      to: [email],
      subject: `🎉 Bem-vindo${name ? `, ${name}` : ""} à JVPECASEACESSORIOS!`,
      html: generateWelcomeEmailTemplate(name),
    })
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail de boas-vindas:", error)
  }
}

function generateWelcomeEmailTemplate(name?: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const displayName = name ? name : "amigo(a)"
  const discountCode = "JVPE10" // exemplo de cupom fixo de 10% off

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Bem-vindo à JVPECASEACESSORIOS</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 40px; color: white; text-align: center; border-radius: 10px;">
        <h1>🎉 Olá, ${displayName}!</h1>
        <p>Obrigado por se inscrever na nossa newsletter!</p>
      </div>

      <div style="padding: 30px 0;">
        <h2>Você acaba de ganhar um cupom exclusivo:</h2>
        <p style="font-size: 22px; font-weight: bold; color: #667eea; text-align: center;">${discountCode}</p>
        <p style="text-align: center; color: #555;">Use este código para ganhar <strong>10% de desconto</strong> na sua próxima compra.</p>

        <h3>O que você vai receber com a gente:</h3>
        <ul style="line-height: 1.8; color: #666;">
          <li>🎯 Ofertas exclusivas para assinantes</li>
          <li>🚀 Lançamentos em primeira mão</li>
          <li>💰 Cupons de desconto especiais</li>
          <li>📦 Dicas e novidades do mundo automotivo</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/produtos"
             style="background: #667eea; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver Produtos
          </a>
        </div>
      </div>

      <footer style="text-align: center; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
        <p>JVPECASEACESSORIOS - Peças e Acessórios de Qualidade</p>
      </footer>
    </body>
    </html>
  `
}

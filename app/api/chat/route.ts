import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "JV Chat",
      },
      body: JSON.stringify({
       model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente inteligente da loja JV Peças. Responda com clareza e simpatia, tirando dúvidas sobre produtos, pedidos e atendimento ao cliente.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro OpenRouter:", errorData);
      return NextResponse.json({ error: "Erro ao responder com IA" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erro no /api/chat:", error);
    return NextResponse.json({ error: "Erro interno no chat" }, { status: 500 });
  }
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Minimize2, Maximize2, Phone, Mail } from "lucide-react"

// --- Tipagem de Mensagem ---
interface Message {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date // Usar Date para melhor manipulação de tempo
}

// --- Componente LiveChat ---
export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isOnline, setIsOnline] = useState(true) // Simula status de online
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null) // Para auto-scroll

  // --- Efeitos de Lado (Hooks) ---

  // Efeito 1: Simular status online/offline
  useEffect(() => {
    // A cada 30 segundos, simula se o suporte está online (90% de chance)
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1)
    }, 30000)

    // Limpa o intervalo ao desmontar o componente
    return () => clearInterval(interval)
  }, []) // Executa apenas uma vez na montagem

  // Efeito 2: Auto-scroll para a última mensagem sempre que 'messages' é atualizado
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  // Efeito 3: Mensagem de boas-vindas ao abrir o chat ou mudar status
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = isOnline
        ? "Olá! 👋 Como posso ajudá-lo hoje? Estou aqui para esclarecer suas dúvidas sobre nossos produtos."
        : "Olá! No momento estamos offline. Deixe sua mensagem que responderemos em breve, ou entre em contato direto conosco."

      // Adiciona a mensagem de boas-vindas com um pequeno atraso para UX
      setTimeout(() => {
        addSupportMessage(welcomeMessage)
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, messages.length, isOnline]) // Dependências: isOpen, se a lista de mensagens está vazia, e o status online

  // --- Funções de Manipulação de Mensagens ---

  // useCallback para memorizar addSupportMessage e evitar recriação desnecessária
  const addSupportMessage = useCallback((text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: "support",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])

    // Incrementa contador de não lidas se o chat não estiver aberto ou estiver minimizado
    if (!isOpen || isMinimized) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [isOpen, isMinimized]) // Depende de isOpen e isMinimized para saber se deve contar não lidas

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return // Não envia mensagens vazias

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage]) // Adiciona a mensagem do usuário
    setNewMessage("") // Limpa o input

    // Simula uma resposta automática do suporte
    setTimeout(
      () => {
        const responses = [
          "Obrigado pela sua mensagem! Vou verificar isso para você.",
          "Entendi sua dúvida. Deixe-me buscar essas informações.",
          "Ótima pergunta! Posso ajudá-lo com isso.",
          "Vou encaminhar sua solicitação para nossa equipe especializada.",
          "Tem mais alguma dúvida que posso esclarecer?",
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        addSupportMessage(randomResponse) // Usa a função memorizada
      },
      1000 + Math.random() * 2000, // Atraso de 1 a 3 segundos para a resposta
    )
  }, [newMessage, addSupportMessage]) // Depende de newMessage e addSupportMessage

  // --- Funções de Controle do Estado do Chat ---

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0) // Zera o contador ao abrir
  }

  const handleMinimizeChat = () => {
    setIsMinimized(true)
    // Manter unreadCount se houver novas mensagens enquanto minimizado,
    // ou zerar se o usuário já viu tudo antes de minimizar.
    // No seu código, você zera, o que pode ser uma escolha de design válida.
    // setUnreadCount(0); // Comentado para não zerar se houver novas mensagens antes de minimizar
  }

  const handleMaximizeChat = () => {
    setIsMinimized(false)
    setUnreadCount(0) // Zera o contador ao maximizar
  }

  const handleCloseChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setUnreadCount(0) // Zera o contador ao fechar
    setMessages([]); // Limpa as mensagens ao fechar o chat
  }

  // --- Renderização do Componente ---
  return (
    <>
      {/* Botão Flutuante de Chat (aparece quando o chat não está aberto) */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
          size="lg"
          aria-label="Abrir chat de suporte"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Contador de Mensagens Não Lidas */}
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
              aria-live="polite" // Anuncia mudanças para leitores de tela
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Janela do Chat (aparece quando o chat está aberto) */}
      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 z-50 shadow-xl transition-all duration-300 flex flex-col ${
            isMinimized ? "w-80 h-16" : "w-80 h-96"
          }`}
          aria-live="polite" // Anuncia o conteúdo dinâmico do chat
          aria-labelledby="chat-title"
        >
          {/* Cabeçalho do Chat */}
          <CardHeader className="pb-2 flex-shrink-0"> {/* flex-shrink-0 para evitar encolher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  {/* Indicador de Status Online/Offline */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                    aria-label={isOnline ? "Suporte Online" : "Suporte Offline"}
                  />
                </div>
                <div>
                  <CardTitle id="chat-title" className="text-sm">Suporte JVPECAS</CardTitle>
                  <p className="text-xs text-gray-600">{isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>

              {/* Botões de Ação do Cabeçalho (Minimizar/Maximizar/Fechar) */}
              <div className="flex gap-1">
                {!isMinimized && (
                  <Button variant="ghost" size="sm" onClick={handleMinimizeChat} aria-label="Minimizar chat">
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                )}
                {isMinimized && (
                  <Button variant="ghost" size="sm" onClick={handleMaximizeChat} aria-label="Maximizar chat">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleCloseChat} aria-label="Fechar chat">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Conteúdo Principal do Chat (Mensagens e Input) */}
          {!isMinimized && (
            <CardContent className="flex flex-col flex-1 p-0"> {/* flex-1 para preencher espaço */}
              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.sender === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Referência para auto-scroll */}
              </div>

              {/* Área de Input de Mensagem / Contato Offline */}
              <div className="p-4 border-t flex-shrink-0"> {/* flex-shrink-0 para evitar encolher */}
                {isOnline ? (
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                      aria-label="Campo de mensagem"
                      disabled={!isOnline} // Desabilita se offline
                    />
                    <Button
                      size="sm"
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isOnline} // Desabilita se mensagem vazia ou offline
                      aria-label="Enviar mensagem"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <p className="text-xs text-gray-600">Estamos offline no momento. Entre em contato por:</p>
                    <div className="flex flex-col gap-2"> {/* Alterado para col para melhor responsividade */}
                      <Button size="sm" variant="outline" asChild>
                        <a href="https://wa.me/5579996828167" target="_blank" rel="noopener noreferrer" aria-label="Entrar em contato via WhatsApp">
                          <Phone className="w-3 h-3 mr-1" />
                          WhatsApp (79) 99682-8167
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href="Jvpecas2003@bol.com.br" aria-label="Enviar um e-mail">
                          <Mail className="w-3 h-3 mr-1" />
                          Jvpecas2003@bol.com.br
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  )
}
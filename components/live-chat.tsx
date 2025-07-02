"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, Minimize2, Maximize2, Phone, Mail } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = isOnline
        ? "Olá! 👋 Como posso ajudá-lo hoje?"
        : "Olá! No momento estamos offline. Deixe sua mensagem."
      setTimeout(() => addSupportMessage(welcomeMessage), 1000)
    }
  }, [isOpen, messages.length, isOnline])

  const addSupportMessage = useCallback((text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: "support",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
    if (!isOpen || isMinimized) setUnreadCount((prev) => prev + 1)
  }, [isOpen, isMinimized])

 const sendMessage = useCallback(async () => {
  if (!newMessage.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: newMessage,
    sender: "user",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setNewMessage("");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage }),  // <-- enviar só message string
    });

    const data = await res.json();

    if (res.ok && data.reply) {
      addSupportMessage(data.reply);
    } else {
      addSupportMessage("Desculpe, ocorreu um erro. Tente novamente.");
    }
  } catch (err) {
    addSupportMessage("Erro ao se conectar com o servidor.");
  }
}, [newMessage, addSupportMessage]);

  const handleOpenChat = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setUnreadCount(0)
  }
  const handleMinimizeChat = () => setIsMinimized(true)
  const handleMaximizeChat = () => {
    setIsMinimized(false)
    setUnreadCount(0)
  }
  const handleCloseChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setUnreadCount(0)
    setMessages([])
  }

  return (
    <>
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
          aria-label="Abrir chat de suporte"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 z-50 shadow-xl transition-all duration-300 flex flex-col ${isMinimized ? "w-80 h-16" : "w-80 h-96"}`}
          aria-labelledby="chat-title"
        >
          <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
                <div>
                  <CardTitle id="chat-title" className="text-sm">Suporte JVPECAS</CardTitle>
                  <p className="text-xs text-gray-600">{isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {!isMinimized && (
                  <Button variant="ghost" size="sm" onClick={handleMinimizeChat}>
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                )}
                {isMinimized && (
                  <Button variant="ghost" size="sm" onClick={handleMaximizeChat}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleCloseChat}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="flex flex-col flex-1 p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${message.sender === "user" ? "bg-primary text-white" : "bg-gray-100 text-gray-900"}`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t flex-shrink-0">
                {isOnline ? (
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                      disabled={!isOnline}
                    />
                    <Button
                      size="sm"
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isOnline}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <p className="text-xs text-gray-600">Estamos offline no momento. Entre em contato por:</p>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href="https://wa.me/5579996828167" target="_blank" rel="noopener noreferrer">
                          <Phone className="w-3 h-3 mr-1" /> WhatsApp (79) 99682-8167
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href="mailto:Jvpecas2003@bol.com.br">
                          <Mail className="w-3 h-3 mr-1" /> Jvpecas2003@bol.com.br
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

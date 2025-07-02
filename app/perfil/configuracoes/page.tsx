import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

import { updateUserInfo } from "@/app/actions/update-user-info" // ⬅️ importe a ação

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function ConfiguracoesPage() {
  const userSession = await getCurrentUser()
  if (!userSession) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: { id: true, name: true, email: true, phone: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Configurações da Conta</h1>

      <form action={updateUserInfo}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Nome</label>
              <Input name="name" defaultValue={user.name || ""} />
            </div>

            <div>
              <label className="text-sm text-gray-600">Telefone</label>
              <Input name="phone" defaultValue={user.phone || ""} />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <Input disabled value={user.email} />
            </div>

            <Button type="submit">Salvar Alterações</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

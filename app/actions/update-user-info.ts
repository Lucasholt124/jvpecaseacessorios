"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateUserInfo(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Usuário não autenticado")

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string

  await prisma.user.update({
    where: { id: user.id },
    data: { name, phone },
  })

  revalidatePath("/configuracoes")
}

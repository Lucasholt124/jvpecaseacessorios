import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PerfilPageClient from "./PerfilPageClient"

export default async function PerfilPage() {
  const userMinimal = await getCurrentUser()
  if (!userMinimal) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: userMinimal.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })
  if (!user) redirect("/login")

  const totalOrders = await prisma.order.count({
    where: { userId: user.id },
  })

  const totalSpentAggregate = await prisma.order.aggregate({
    where: { userId: user.id, status: "DELIVERED" },
    _sum: { total: true },
  })
  const totalSpent = totalSpentAggregate._sum.total ?? 0

  const favoriteProductsCount = await prisma.wishlistItem.count({
    where: { userId: user.id },
  })

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
  })

  return (
    <PerfilPageClient
      user={{
        ...user,
        createdAt: user.createdAt.toISOString(),
      }}
      totalOrders={totalOrders}
      totalSpent={totalSpent}
      favoriteProductsCount={favoriteProductsCount}
      addresses={addresses}
    />
  )
}

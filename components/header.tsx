// components/header/index.tsx
import { getCurrentUser } from "@/lib/auth"
import ClientHeader from "./client-header"

export default async function Header() {
  const user = await getCurrentUser()

  return <ClientHeader user={user} />
}

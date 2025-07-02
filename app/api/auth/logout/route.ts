import { NextResponse } from "next/server"
import { logout } from "@/lib/auth" // ajuste o caminho se necessário

export async function POST() {
  await logout()
  return NextResponse.json({ success: true })
}

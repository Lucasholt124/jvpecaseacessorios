import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { message: "Logout efetuado" },
    {
      status: 200,
      headers: {
        "Set-Cookie": `token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
      },
    }
  )
}

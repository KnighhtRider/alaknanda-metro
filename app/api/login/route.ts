import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const user = await prisma.users.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // ⚠️ Skip if you're storing plain text passwords (not recommended)
  const isValid = password === user.password;

  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create session cookie
  const response = NextResponse.json({ success: true });

  response.cookies.set("cms_session", user.id.toString(), {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
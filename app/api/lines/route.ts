import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const lines = await prisma.line.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(lines);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Line name is required" },
        { status: 400 }
      );
    }

    const line = await prisma.line.create({
      data: {
        name: body.name.trim(),
        color: body.color || null,
      },
    });

    return NextResponse.json({ success: true, line });
  } catch (error: any) {
    console.error("❌ Add line failed:", error);

    // Handle unique constraint nicely
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Line already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add line" },
      { status: 500 }
    );
  }
}

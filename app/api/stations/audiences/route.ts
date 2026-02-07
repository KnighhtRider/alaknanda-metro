import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const audiences = await prisma.stationAudience.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(audiences);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Audience name is required" },
        { status: 400 }
      );
    }

    const audience = await prisma.stationAudience.create({
      data: {
        name: body.name.trim(),
      },
    });

    return NextResponse.json({ success: true, audience });
  } catch (error: any) {
    console.error("❌ Add audience failed:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Audience already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add audience" },
      { status: 500 }
    );
  }
}

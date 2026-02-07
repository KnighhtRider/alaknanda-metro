import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const types = await prisma.stationType.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Type name is required" },
        { status: 400 }
      );
    }

    const type = await prisma.stationType.create({
      data: {
        name: body.name.trim(),
      },
    });

    return NextResponse.json({ success: true, type });
  } catch (error: any) {
    console.error("❌ Add type failed:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Type already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add type" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ---------------- PUT ---------------- */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params
    const numericId = Number(id);

    const body = await request.json();

    const line = await prisma.line.update({
      where: { id: numericId },
      data: {
        name: body.name,
        color: body.color || null,
      },
    });

    return NextResponse.json({ success: true, line });
  } catch (error) {
    console.error("Update line failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/* ---------------- DELETE ---------------- */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ await params
    const numericId = Number(id);

    await prisma.line.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete line failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

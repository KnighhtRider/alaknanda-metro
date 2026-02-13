import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ UPDATE LINE
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // fix here
) {
  try {
    const numericId = Number(params.id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid line ID" },
        { status: 400 }
      );
    }

    const body: { name?: string; color?: string | null } = await req.json();

    const line = await prisma.line.update({
      where: { id: numericId },
      data: {
        name: body.name,
        color: body.color ?? null,
      },
    });

    return NextResponse.json({ success: true, line });
  } catch (error) {
    console.error("Update line failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update line" },
      { status: 500 }
    );
  }
}

// ✅ DELETE LINE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // fix here too
) {
  try {
    const numericId = Number(params.id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid line ID" },
        { status: 400 }
      );
    }

    await prisma.line.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete line failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete line" },
      { status: 500 }
    );
  }
}

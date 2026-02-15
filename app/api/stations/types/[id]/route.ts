import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ✅ Required for Prisma on Vercel

// ✅ UPDATE STATION TYPE
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Next 15 fix
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid type ID" },
        { status: 400 }
      );
    }

    const body: { name?: string } = await req.json();

    const type = await prisma.stationType.update({
      where: { id: numericId },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json({ success: true, type });
  } catch (error) {
    console.error("Update type failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update type" },
      { status: 500 }
    );
  }
}

// ✅ DELETE STATION TYPE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Next 15 fix
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid type ID" },
        { status: 400 }
      );
    }

    await prisma.stationType.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete type failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete type" },
      { status: 500 }
    );
  }
}

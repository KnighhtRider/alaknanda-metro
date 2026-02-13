import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// ✅ Singleton Prisma client for Vercel
const prisma = globalThis.prisma || new PrismaClient();
if (!globalThis.prisma) globalThis.prisma = prisma;

// ✅ UPDATE STATION TYPE
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // ❌ removed Promise<>
) {
  try {
    const numericId = Number(params.id);

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
  { params }: { params: { id: string } } // ❌ removed Promise<>
) {
  try {
    const numericId = Number(params.id);

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

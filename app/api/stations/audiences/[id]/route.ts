import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ✅ Required for Prisma on Vercel

// ✅ UPDATE AUDIENCE
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Next 15 fix
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid audience ID" },
        { status: 400 }
      );
    }

    const body: { name?: string } = await req.json();

    const audience = await prisma.stationAudience.update({
      where: { id: numericId },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json({ success: true, audience });
  } catch (error) {
    console.error("Update audience failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update audience" },
      { status: 500 }
    );
  }
}

// ✅ DELETE AUDIENCE
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Next 15 fix
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid audience ID" },
        { status: 400 }
      );
    }

    await prisma.stationAudience.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete audience failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete audience" },
      { status: 500 }
    );
  }
}

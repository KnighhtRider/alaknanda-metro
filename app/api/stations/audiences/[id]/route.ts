import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ UPDATE AUDIENCE
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

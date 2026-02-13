import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ UPDATE PRODUCT
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body: {
      name?: string;
      thumbnail?: string | null;
      defaultRateMonth?: number | null;
      defaultRateDay?: number | null;
    } = await req.json();

    const product = await prisma.product.update({
      where: { id: numericId },
      data: {
        name: body.name,
        thumbnail: body.thumbnail ?? null,
        defaultRateMonth: body.defaultRateMonth ?? null,
        defaultRateDay: body.defaultRateDay ?? null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Update product failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ DELETE PRODUCT
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}

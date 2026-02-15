import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ✅ Required for Prisma on Vercel

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ Next 15 requires await

    await prisma.contactUsSubmission.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE LEAD ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete lead" },
      { status: 500 }
    );
  }
}

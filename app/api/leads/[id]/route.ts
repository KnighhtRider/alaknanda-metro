import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contactUsSubmission.delete({
      where: { id: Number(params.id) },
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

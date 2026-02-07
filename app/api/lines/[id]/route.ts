import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const line = await prisma.line.update({
      where: { id },
      data: {
        name: body.name,
        color: body.color || null,
      },
    });

    return NextResponse.json({ success: true, line });
  } catch (e) {
    console.error("Update line failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    await prisma.line.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete line failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

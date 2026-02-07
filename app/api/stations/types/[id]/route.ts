import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const type = await prisma.stationType.update({
      where: { id },
      data: { name: body.name },
    });

    return NextResponse.json({ success: true, type });
  } catch (e) {
    console.error("Update type failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    await prisma.stationType.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete type failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

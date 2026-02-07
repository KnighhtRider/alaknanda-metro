import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const audience = await prisma.stationAudience.update({
      where: { id },
      data: { name: body.name },
    });

    return NextResponse.json({ success: true, audience });
  } catch (e) {
    console.error("Update audience failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    await prisma.stationAudience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete audience failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

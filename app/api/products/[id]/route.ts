import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        thumbnail: body.thumbnail || null,
        defaultRateMonth: body.defaultRateMonth ?? null,
        defaultRateDay: body.defaultRateDay ?? null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (e) {
    console.error("Update product failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete product failed:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) {
      return NextResponse.json({ error: "Missing station ID" }, { status: 400 });
    }

    await prisma.station.delete({ where: { id } });

    return NextResponse.json({ message: "Station deleted" });
  } catch (_e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
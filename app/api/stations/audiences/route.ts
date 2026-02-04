import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const data = await prisma.stationAudience.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(data);
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const leads = await prisma.contactUsSubmission.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(leads);
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all required data
    const [lines, products, audiences, types] = await Promise.all([
      prisma.line.findMany({ orderBy: { id: "asc" } }),
      prisma.product.findMany({ orderBy: { id: "asc" } }),
      prisma.stationAudience.findMany({ orderBy: { id: "asc" } }),
      prisma.stationType.findMany({ orderBy: { id: "asc" } }),
    ]);

    // Return as JSON
    return NextResponse.json({
      lines,
      products,
      audiences,
      types,
    });
  } catch (error) {
    console.error("❌ Fetching station data failed:", error);
    return NextResponse.json({ error: "Failed to fetch station data" }, { status: 500 });
  }
}

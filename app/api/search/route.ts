import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({
      stations: [],
      lines: [],
      products: [],
    });
  }

  try {
    const [stations, lines, products] = await Promise.all([
      prisma.station.findMany({
        where: {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        include: {
          images: true,
          lines: { include: { line: true } },
        },
        take: 8,
      }),

      prisma.line.findMany({
        where: {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        take: 5,
      }),

      prisma.product.findMany({
        where: {
          name: {
            contains: q,
            mode: "insensitive",
          },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      stations,
      lines,
      products,
    });
  } catch (e) {
    console.error("Search error:", e);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

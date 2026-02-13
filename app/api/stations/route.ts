// app/api/stations/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// ✅ Singleton Prisma client for serverless
declare global {
  var prisma: PrismaClient | undefined;
}
const prisma: PrismaClient = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      include: {
        images: true,
        lines: { include: { line: true } },
        products: { include: { product: true } },
        audiences: { include: { audience: true } },
        types: { include: { type: true } },
      },
      orderBy: { id: "asc" },
    });

    // Flatten and structure data for frontend
    const response = stations.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      footfall: s.footfall,
      totalInventory: s.totalInventory,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,

      images: s.images,

      lines: s.lines.map((sl: any) => ({
        id: sl.line.id,
        name: sl.line.name,
        color: sl.line.color,
      })),

      products: s.products.map((sp: any) => ({
        id: sp.product.id,
        name: sp.product.name,
        thumbnail: sp.product.thumbnail,
        defaultRateMonth: sp.product.defaultRateMonth,
        defaultRateDay: sp.product.defaultRateDay,
        units: sp.units,
        rateMonth: sp.rateMonth ?? sp.product.defaultRateMonth,
        rateDay: sp.rateDay ?? sp.product.defaultRateDay,
      })),

      audiences: s.audiences.map((sa: any) => ({
        id: sa.audience.id,
        name: sa.audience.name,
      })),

      types: s.types.map((st: any) => ({
        id: st.type.id,
        name: st.type.name,
      })),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ /api/stations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

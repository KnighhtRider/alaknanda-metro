import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const stations = await prisma.station.findMany({
    include: {
      images: true,

      // Lines (join → master)
      lines: {
        include: {
          line: true,
        },
      },

      // Products (join → master)
      products: {
        include: {
          product: true,
        },
      },

      // Audiences (join → master)
      audiences: {
        include: {
          audience: true,
        },
      },

      // Types (join → master)
      types: {
        include: {
          type: true,
        },
      },
    },
  });

  return NextResponse.json(
    stations.map((s: any) => ({
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

      // ✅ Lines (with color)
      lines: s.lines.map((sl: any) => ({
        id: sl.line.id,
        name: sl.line.name,
        color: sl.line.color,
      })),

      // ✅ Products (flattened + fallback logic)
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

      // ✅ Audiences
      audiences: s.audiences.map((sa: any) => ({
        id: sa.audience.id,
        name: sa.audience.name,
      })),

      // ✅ Types
      types: s.types.map((st: any) => ({
        id: st.type.id,
        name: st.type.name,
      })),
    }))
  );
}

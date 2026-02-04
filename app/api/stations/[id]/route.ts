import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const stationId = Number(id);
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: {
        images: true,

        // join table → include the actual Line master data
        lines: {
          include: {
            line: true,
          },
        },

        // join table → include the actual Product master data
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Format response similar to your previous list structure
    const formatted = {
      id: station.id,
      name: station.name,
      description: station.description,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      footfall: station.footfall,
      totalInventory: station.totalInventory,
      images: station.images,
      lines: station.lines.map((sl: any) => sl.line.name),
      products: station.products.map((sp: any) => ({
        id: sp.product.id,
        name: sp.product.name,
        thumbnail: sp.product.thumbnail,

        // master rates
        defaultRateMonth: sp.product.defaultRateMonth,
        defaultRateDay: sp.product.defaultRateDay,

        // station overrides
        units: sp.units,
        rateMonth: sp.rateMonth ?? sp.product.defaultRateMonth,
        rateDay: sp.rateDay ?? sp.product.defaultRateDay,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching station:", error);
    return NextResponse.json(
      { error: "Failed to fetch station details" },
      { status: 500 }
    );
  }
}

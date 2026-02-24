import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* ---------------- GET STATION BY ID ---------------- */

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

        lines: {
          include: { line: true },
        },

        products: {
          include: { product: true },
        },

        audiences: {
          include: { audience: true },
        },

        types: {
          include: { type: true },
        },
      },
    });

    if (!station) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: station.id,
      name: station.name,
      description: station.description,
      address: station.address,
      latitude: station.latitude,
      longitude: station.longitude,
      footfall: station.footfall,
      totalInventory: station.totalInventory,

      // images as string[]
      images: station.images.map((img) => img.imageUrl),

      // IDs (for CMS / backward compat)
      lines: station.lines.map((sl) => sl.line.id),
      audiences: station.audiences.map((sa) => sa.audience.id),
      types: station.types.map((st) => st.type.id),

      // Names (for auto-generated description)
      lineNames: station.lines.map((sl) => sl.line.name),
      audienceNames: station.audiences.map((sa) => sa.audience.name),
      typeNames: station.types.map((st) => st.type.name),

      products: station.products.map((sp) => ({
        id: sp.product.id,
        name: sp.product.name,
        thumbnail: sp.product.thumbnail,

        defaultRateMonth: sp.product.defaultRateMonth,
        defaultRateDay: sp.product.defaultRateDay,

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


/* ---------------- DELETE STATION (FIXED) ---------------- */

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const stationId = Number(id);

    // 🔥 Delete all dependent relations first (to avoid FK constraint errors)
    await prisma.stationLine.deleteMany({ where: { stationId } });
    await prisma.stationProduct.deleteMany({ where: { stationId } });
    await prisma.stationImage.deleteMany({ where: { stationId } });
    await prisma.stationAudienceMap.deleteMany({ where: { stationId } });
    await prisma.stationTypeMap.deleteMany({ where: { stationId } });

    // ✅ Now delete the station
    await prisma.station.delete({
      where: { id: stationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete station failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

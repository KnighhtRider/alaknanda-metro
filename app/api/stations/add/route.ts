import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. CREATE STATION
    const station = await prisma.station.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        address: body.address ?? null,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        footfall: body.footfall ?? null,
        totalInventory: body.totalInventory
          ? Number(body.totalInventory)
          : null,
      },
    });

    //
    // 2. ADD IMAGES
    //
    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.stationImage.createMany({
        data: body.images
          .filter((url: string) => url.trim() !== "")
          .map((url: string) => ({
            stationId: station.id,
            imageUrl: url,
          })),
      });
    }

    //
    // 3. ADD LINES (StationLine table)
    //
    if (Array.isArray(body.lineIds)) {
      await prisma.stationLine.createMany({
        data: body.lineIds.map((lineId: number) => ({
          stationId: station.id,
          lineId: Number(lineId),
        })),
        skipDuplicates: true,
      });
    }

    if (Array.isArray(body.audienceIds)) {
      await prisma.stationAudience.createMany({
        data: body.audienceIds.map((audienceId: number) => ({
          stationId: station.id,
          audienceId: Number(audienceId),
        })),
        skipDuplicates: true,
      });
    }

    if (Array.isArray(body.typeIds)) {
      await prisma.stationType.createMany({
        data: body.typeIds.map((typeId: number) => ({
          stationId: station.id,
          typeId: Number(typeId),
        })),
        skipDuplicates: true,
      });
    }
    //
    // 4. ADD PRODUCTS (StationProduct table)
    //
    if (Array.isArray(body.products)) {
      // body.products = [{ productId, units, rateMonth, rateDay }]
      await prisma.stationProduct.createMany({
        data: body.products.map((p: any) => ({
          stationId: station.id,
          productId: Number(p.productId),
          units: p.units ? Number(p.units) : null,
          rateMonth: p.rateMonth ? Number(p.rateMonth) : null,
          rateDay: p.rateDay ? Number(p.rateDay) : null,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(
      { message: "Station created", stationId: station.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Station Creation Error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

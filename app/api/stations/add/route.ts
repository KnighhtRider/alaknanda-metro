import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming payload:", body);

    const station = await prisma.station.create({
      data: {
        name: body.name,
        description: body.description || null,
        address: body.address || null,
        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
        footfall: body.footfall ? String(body.footfall) : null,
        totalInventory: body.totalInventory
          ? Number(body.totalInventory)
          : null,
      },
    });

    // ✅ Images (correct field name: imageUrl)
    if (body.images?.length) {
      await prisma.stationImage.createMany({
        data: body.images.map((img: string) => ({
          imageUrl: img,
          stationId: station.id,
        })),
      });
    }

    // ✅ Lines
    if (body.lineIds?.length) {
      await prisma.stationLine.createMany({
        data: body.lineIds.map((lineId: number) => ({
          stationId: station.id,
          lineId,
        })),
      });
    }

    // ✅ Products
    if (body.products?.length) {
      await prisma.stationProduct.createMany({
        data: body.products.map((p: any) => ({
          stationId: station.id,
          productId: p.productId,
          units: p.units ?? null,
          rateMonth: p.rateMonth ?? null,
          rateDay: p.rateDay ?? null,
        })),
      });
    }

    // ✅ Audiences
    if (body.audienceIds?.length) {
      await prisma.stationAudienceMap.createMany({
        data: body.audienceIds.map((audienceId: number) => ({
          stationId: station.id,
          audienceId,
        })),
      });
    }

    // ✅ Types
    if (body.typeIds?.length) {
      await prisma.stationTypeMap.createMany({
        data: body.typeIds.map((typeId: number) => ({
          stationId: station.id,
          typeId,
        })),
      });
    }

    return NextResponse.json({ success: true, station });
  } catch (error: any) {
    console.error("❌ Station add failed:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

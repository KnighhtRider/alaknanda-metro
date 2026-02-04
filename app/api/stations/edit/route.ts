import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UpdateBody {
  id: number;
  name?: string;
  description?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  footfall?: string;
  totalInventory?: number;

  images?: string[];
  lineIds?: number[];
  products?: {
    productId: number;
    units?: number;
    rateMonth?: number;
    rateDay?: number;
  }[];
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as UpdateBody;

    if (!body.id) {
      return NextResponse.json({ error: "Station ID missing" }, { status: 400 });
    }

    const stationId = Number(body.id);

    // 1. Update base station info
    await prisma.station.update({
      where: { id: stationId },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        footfall: body.footfall,
        totalInventory: body.totalInventory ?? undefined,
      },
    });

    // 2. Replace images
    if (body.images) {
      await prisma.stationImage.deleteMany({ where: { stationId } });

      await prisma.stationImage.createMany({
        data: body.images
          .filter((url) => url.trim() !== "")
          .map((url) => ({
            stationId,
            imageUrl: url,
          })),
      });
    }

    // 3. Replace lines
    if (body.lineIds) {
      await prisma.stationLine.deleteMany({ where: { stationId } });

      await prisma.stationLine.createMany({
        data: body.lineIds.map((lineId) => ({
          stationId,
          lineId: Number(lineId),
        })),
      });
    }

    // 4. Replace product mappings
    if (body.products) {
      await prisma.stationProduct.deleteMany({ where: { stationId } });

      await prisma.stationProduct.createMany({
        data: body.products.map((p) => ({
          stationId,
          productId: Number(p.productId),
          units: p.units ?? null,
          rateMonth: p.rateMonth ?? null,
          rateDay: p.rateDay ?? null,
        })),
      });
    }

    return NextResponse.json({ message: "Station updated" });
  } catch (err) {
    console.error("Station Update Error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: 0, failed: 0 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    let success = 0;
    let failed = 0;

    for (const row of rows.slice(0, 100)) {
      try {
        // ❗ REQUIRED FIELD
        if (!row.name) {
          failed++;
          continue;
        }

        // ---------------- PARSE FIELDS ----------------

        const images = row.images
          ? String(row.images).split(",").map((s: string) => s.trim())
          : [];

        const lineIds = row.lineIds
          ? String(row.lineIds)
            .split(",")
            .map((n: string) => Number(n.trim()))
          : [];

        const audienceIds = row.audienceIds
          ? String(row.audienceIds)
            .split(",")
            .map((n: string) => Number(n.trim()))
          : [];

        const typeIds = row.typeIds
          ? String(row.typeIds)
            .split(",")
            .map((n: string) => Number(n.trim()))
          : [];

        // products format => productId:units:rateMonth:rateDay
        const products = row.products
          ? String(row.products).split(",").map((p: string) => {
            const [productId, units, rateMonth, rateDay] = p.split(":");

            return {
              productId: Number(productId),
              units: units ? Number(units) : null,
              rateMonth: rateMonth ? Number(rateMonth) : null,
              rateDay: rateDay ? Number(rateDay) : null,
            };
          })
          : [];

        // ---------------- CREATE STATION ----------------

        const station = await prisma.station.create({
          data: {
            name: row.name,
            description: row.description || null,
            address: row.address || null,
            latitude: row.latitude ? Number(row.latitude) : null,
            longitude: row.longitude ? Number(row.longitude) : null,
            footfall: row.footfall ? String(row.footfall) : null,
            totalInventory: row.totalInventory
              ? Number(row.totalInventory)
              : null,
          },
        });

        // ---------------- RELATIONS ----------------

        if (images.length) {
          await prisma.stationImage.createMany({
            data: images.map((img: string) => ({
              stationId: station.id,
              imageUrl: img,
            })),
          });
        }

        if (lineIds.length) {
          await prisma.stationLine.createMany({
            data: lineIds.map((id: number) => ({
              stationId: station.id,
              lineId: id,
            })),
          });
        }

        if (products.length) {
          await prisma.stationProduct.createMany({
            data: products.map((p: any) => ({
              stationId: station.id,
              productId: p.productId,
              units: p.units,
              rateMonth: p.rateMonth,
              rateDay: p.rateDay,
            })),
          });
        }

        if (audienceIds.length) {
          await prisma.stationAudienceMap.createMany({
            data: audienceIds.map((id: number) => ({
              stationId: station.id,
              audienceId: id,
            })),
          });
        }

        if (typeIds.length) {
          await prisma.stationTypeMap.createMany({
            data: typeIds.map((id: number) => ({
              stationId: station.id,
              typeId: id,
            })),
          });
        }

        success++;
      } catch (err) {
        console.error("Row failed:", row.name, err);
        failed++;
      }
    }

    return NextResponse.json({ success, failed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: 0, failed: 0 });
  }
}

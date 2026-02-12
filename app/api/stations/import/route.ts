import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const data: any[] = XLSX.utils.sheet_to_json(worksheet);

  for (const row of data) {
    await prisma.station.create({
      data: {
        name: row.Name,
        address: row.Address,
        footfall: row.Footfall,
        totalInventory: Number(row.TotalInventory),
      },
    });
  }

  return NextResponse.json({ success: true });
}

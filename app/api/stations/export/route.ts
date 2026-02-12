import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function GET() {
  const stations = await prisma.station.findMany({
    include: {
      lines: { include: { line: true } },
      audiences: { include: { audience: true } },
      types: { include: { type: true } },
    },
  });

  const formatted = stations.map((s) => ({
    ID: s.id,
    Name: s.name,
    Address: s.address,
    Footfall: s.footfall,
    TotalInventory: s.totalInventory,
    Lines: s.lines.map((l) => l.line.name).join(", "),
    Audiences: s.audiences.map((a) => a.audience.name).join(", "),
    Types: s.types.map((t) => t.type.name).join(", "),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stations");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return new NextResponse(buffer, {
    headers: {
      "Content-Disposition": "attachment; filename=stations.xlsx",
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}

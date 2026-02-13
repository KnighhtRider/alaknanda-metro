import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [lines, products, audiences, types] = await Promise.all([
      prisma.line.findMany({ orderBy: { id: "asc" } }),
      prisma.product.findMany({ orderBy: { id: "asc" } }),
      prisma.stationAudience.findMany({ orderBy: { id: "asc" } }),
      prisma.stationType.findMany({ orderBy: { id: "asc" } }),
    ]);

    const workbook = new ExcelJS.Workbook();

    /* ============================================================
       SHEET 1 → STATIONS
    ============================================================ */

    const sheet = workbook.addWorksheet("Stations");

    const headers = [
      "name",
      "description",
      "address",
      "latitude",
      "longitude",
      "footfall",
      "totalInventory",
      "images",
      "lineNames",
      "products",
      "audiences",
      "types",
    ];

    sheet.addRow(headers);

    // Style header
    sheet.getRow(1).font = { bold: true };

    // Description row
    sheet.addRow([
      "Unique station name (required)",
      "Station description",
      "Full address",
      "Latitude (decimal)",
      "Longitude (decimal)",
      "Daily footfall",
      "Total inventory count",
      "Comma separated image URLs",
      "Comma separated line names",
      "ProductName:units:rateMonth:rateDay",
      "Comma separated audience names",
      "Comma separated type names",
    ]);

    sheet.getRow(2).font = { italic: true };

    // Demo row
    sheet.addRow([
      "Rajiv Chowk",
      "Central interchange station",
      "Connaught Place, Delhi",
      28.6328,
      77.2197,
      "500000",
      120,
      "https://image1.jpg, https://image2.jpg",
      "Yellow Line, Blue Line",
      "Backlit Panel:20:2500:80, Digital Screen:5:5000:200",
      "Students, Office Workers",
      "Interchange",
    ]);

    sheet.columns.forEach((col) => {
      col.width = 22;
    });

    /* ============================================================
       SHEET 2 → MASTER_DATA
    ============================================================ */

    const master = workbook.addWorksheet("MASTER_DATA");

    master.getCell("A1").value = "LINES";
    master.getCell("B1").value = "PRODUCTS";
    master.getCell("C1").value = "AUDIENCES";
    master.getCell("D1").value = "TYPES";

    master.getRow(1).font = { bold: true };

    lines.forEach((l, i) => {
      master.getCell(`A${i + 2}`).value = l.name;
    });

    products.forEach((p, i) => {
      master.getCell(`B${i + 2}`).value = p.name;
    });

    audiences.forEach((a, i) => {
      master.getCell(`C${i + 2}`).value = a.name;
    });

    types.forEach((t, i) => {
      master.getCell(`D${i + 2}`).value = t.name;
    });

    master.columns.forEach((col) => {
      col.width = 25;
    });

    /* ============================================================
       DATA VALIDATION (Dropdown reference)
    ============================================================ */

    const maxRows = 200;

    for (let i = 3; i <= maxRows; i++) {
      sheet.getCell(`I${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`MASTER_DATA!$A$2:$A$${lines.length + 1}`],
      };

      sheet.getCell(`K${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`MASTER_DATA!$C$2:$C$${audiences.length + 1}`],
      };

      sheet.getCell(`L${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`MASTER_DATA!$D$2:$D$${types.length + 1}`],
      };
    }

    /* ============================================================
       RETURN FILE
    ============================================================ */

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": "attachment; filename=station-template.xlsx",
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("❌ Template generation failed:", error);
    return NextResponse.json({ error: "Template generation failed" }, { status: 500 });
  }
}

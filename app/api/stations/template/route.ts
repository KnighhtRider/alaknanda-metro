import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch all required data
    const [lines, products, audiences, types] = await Promise.all([
      prisma.line.findMany({ orderBy: { id: "asc" } }),
      prisma.product.findMany({ orderBy: { id: "asc" } }),
      prisma.stationAudience.findMany({ orderBy: { id: "asc" } }),
      prisma.stationType.findMany({ orderBy: { id: "asc" } }),
    ]);

    const workbook = XLSX.utils.book_new();

    // 1. Template Sheet
    const templateData = [
      {
        name: "Example Station (Required)",
        description: "A very nice station",
        address: "123 Main St",
        latitude: 28.6139,
        longitude: 77.2090,
        footfall: "5,20,000 riders/day",
        totalInventory: 100,
        images: "url1, url2",
        lineIds: "1, 2",
        audienceIds: "1, 3",
        typeIds: "2",
        products: "1:10:5000:200, 2:5:10000:400"
      }
    ];
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, "Template");

    // 2. Reference: Lines
    const linesSheet = XLSX.utils.json_to_sheet(lines.map(l => ({ ID: l.id, Name: l.name })));
    XLSX.utils.book_append_sheet(workbook, linesSheet, "Lines Reference");

    // 3. Reference: Products
    const productsSheet = XLSX.utils.json_to_sheet(products.map(p => ({ ID: p.id, Name: p.name })));
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Products Reference");

    // 4. Reference: Audiences
    const audiencesSheet = XLSX.utils.json_to_sheet(audiences.map(a => ({ ID: a.id, Name: a.name })));
    XLSX.utils.book_append_sheet(workbook, audiencesSheet, "Audiences Reference");

    // 5. Reference: Types
    const typesSheet = XLSX.utils.json_to_sheet(types.map(t => ({ ID: t.id, Name: t.name })));
    XLSX.utils.book_append_sheet(workbook, typesSheet, "Types Reference");

    // Create buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return as Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="station-import-template.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("❌ Fetching station data failed:", error);
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
  }
}

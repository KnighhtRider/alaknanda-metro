import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: "Product name is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        thumbnail: body.thumbnail || null,
        defaultRateMonth:
          body.defaultRateMonth !== null && body.defaultRateMonth !== undefined
            ? Number(body.defaultRateMonth)
            : null,
        defaultRateDay:
          body.defaultRateDay !== null && body.defaultRateDay !== undefined
            ? Number(body.defaultRateDay)
            : null,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("❌ Add product failed:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Product already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to add product" },
      { status: 500 }
    );
  }
}

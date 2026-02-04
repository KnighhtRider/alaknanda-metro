import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await prisma.contactUsSubmission.create({
      data: {
        requirement: body.requirement,
        buyerType: body.buyerType ?? null,
        familiarity: body.familiarity ?? null,

        companyName: body.companyName,

        // aware flow
        stations: body.stations ?? null,
        adFormat: body.adFormat ?? null,
        budget: body.budget ?? null,

        // advisory flow
        goal: body.goal ?? null,
        audience: body.audience ?? null,
        timeline: body.timeline ?? null,

        // contact
        name: body.name,
        phone: body.phone,
        email: body.email,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("CONTACT_US_ERROR", err);
    return NextResponse.json(
      { error: "Failed to save contact request" },
      { status: 500 }
    );
  }
}

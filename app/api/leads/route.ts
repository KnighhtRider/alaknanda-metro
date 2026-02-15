import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { renderToStream } from "@react-pdf/renderer";
import StationPdf from "@/lib/pdf/StationPdf";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

// GET Leads
export async function GET() {
  const leads = await prisma.contactUsSubmission.findMany({
    orderBy: { createdAt: "asc" }, // newest first
  });

  return NextResponse.json(leads);
}

// POST Lead
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      companyName,
      notes,
      stationId,
      productId,
    } = body;

    // 1️⃣ Fetch station
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: {
        images: true,
        lines: { include: { line: true } },
        products: { include: { product: true } },
      },
    });

    if (!station) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Find product
    const product = station.products.find(
      (p) => p.productId === productId
    );

    // 3️⃣ Save Lead FIRST (this is the only critical operation)
    const lead = await prisma.contactUsSubmission.create({
      data: {
        name,
        email,
        phone,
        companyName,
        notes,
        requirement: "advertise",
        stations: [station.name],
        adFormat: product?.product.name || null,
      },
    });

    // 4️⃣ Send response immediately
    const response = NextResponse.json(
      { success: true, id: lead.id },
      { status: 201 }
    );

    // 5️⃣ Run email + PDF in background (non-blocking)
    (async () => {
      try {
        const pdfStream = await renderToStream(
          StationPdf({ station, product })
        );

        const chunks: Uint8Array[] = [];
        for await (const chunk of pdfStream as any) {
          chunks.push(chunk);
        }
        const pdfBuffer = Buffer.concat(chunks);

        // User email
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: `Your enquiry for ${station.name}`,
          html: `
            <h2>Hello ${name},</h2>
            <p>Thank you for your interest.</p>
            <p><strong>You have enquired for advertising at ${station.name}</strong></p>
            <p>Our team will contact you shortly.</p>
          `,
          attachments: [
            {
              filename: `${station.name}.pdf`,
              content: pdfBuffer,
            },
          ],
        });

        // Admin email
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: process.env.ADMIN_EMAIL!,
          subject: `New Lead - ${station.name}`,
          html: `
            <h3>New Lead Received</h3>
            <p><b>Name:</b> ${name}</p>
            <p><b>Company:</b> ${companyName}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Station:</b> ${station.name}</p>
          `,
        });

      } catch (emailError) {
        console.error("EMAIL ERROR (non-blocking):", emailError);
      }
    })();

    return response;

  } catch (error) {
    console.error("LEAD ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}


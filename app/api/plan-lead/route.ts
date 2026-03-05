import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            name,
            email,
            phone,
            companyName,
            notes,
            stations,
            adFormat,
        } = body;

        // Save Lead
        const lead = await prisma.contactUsSubmission.create({
            data: {
                name,
                email,
                phone,
                companyName,
                notes,
                requirement: "advertise",
                stations: stations,
                adFormat: adFormat,
            },
        });

        const response = NextResponse.json(
            { success: true, id: lead.id },
            { status: 201 }
        );

        // Send emails in background
        (async () => {
            try {
                // User email
                await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
                    to: email,
                    subject: `Your Alaknanda Metro Advertising Plan`,
                    html: `
            <h2>Hello ${name},</h2>
            <p>Thank you for requesting a plan with us.</p>
            <p><strong>We have received your cart details:</strong></p>
            <p>${notes.replace(/\n/g, "<br>")}</p>
            <br/>
            <p>Our team will contact you shortly with formal rates and detailed PDF maps.</p>
          `,
                });

                // Admin email
                await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
                    to: process.env.ADMIN_EMAIL!,
                    subject: `New Plan Lead - ${companyName}`,
                    html: `
            <h3>New Plan Submitted</h3>
            <p><b>Name:</b> ${name}</p>
            <p><b>Company:</b> ${companyName}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone}</p>
            <hr/>
            <p><b>Plan Details:</b></p>
            <p>${notes.replace(/\n/g, "<br>")}</p>
          `,
                });
            } catch (emailError) {
                console.error("EMAIL ERROR (non-blocking):", emailError);
            }
        })();

        return response;

    } catch (error) {
        console.error("PLAN LEAD ERROR:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // ✅ Required for Prisma on Vercel

/* ==================== PUT — Update Lead (e.g. status change) ==================== */

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid lead ID" },
        { status: 400 }
      );
    }

    const leadId = Number(id);
    const body = await request.json();

    // Validate that there's something to update
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields provided to update" },
        { status: 400 }
      );
    }

    // Check lead exists
    const existingLead = await prisma.contactUsSubmission.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    // Build update payload — only allow known safe fields
    const updateData: Record<string, any> = {};

    if (body.status !== undefined) {
      const validStatuses = ["NEW", "CONTACTED", "HOT", "WARM", "COLD", "CLOSED", "LOST"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, message: `Invalid status value: ${body.status}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.name !== undefined) updateData.name = body.name;
    if (body.companyName !== undefined) updateData.companyName = body.companyName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.requirement !== undefined) updateData.requirement = body.requirement;

    const updatedLead = await prisma.contactUsSubmission.update({
      where: { id: leadId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead: updatedLead,
    });

  } catch (error) {
    console.error("PUT LEAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while updating lead",
      },
      { status: 500 }
    );
  }
}

/* ==================== DELETE — Remove Lead ==================== */

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid lead ID" },
        { status: 400 }
      );
    }

    const leadId = Number(id);

    const existingLead = await prisma.contactUsSubmission.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    await prisma.contactUsSubmission.delete({
      where: { id: leadId },
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });

  } catch (error) {
    console.error("DELETE LEAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while deleting lead",
      },
      { status: 500 }
    );
  }
}
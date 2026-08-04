import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, comment } = body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: any = {};
    if (status !== undefined) {
      data.status = status;
    }

    if (comment !== undefined) {
      const existingComments = JSON.parse(lead.comments || "[]");
      const newCommentObj = {
        text: comment,
        createdAt: new Date().toISOString(),
      };
      data.comments = JSON.stringify([...existingComments, newCommentObj]);
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error("PUT Lead CRM Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

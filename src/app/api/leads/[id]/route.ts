import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "@/lib/logger";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    const { id } = await params;
    const body = await request.json();
    const { status, comment, name, phone, details, nextContactDate, source } = body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: any = {};
    if (status !== undefined) {
      data.status = status;
      if (userId && status !== lead.status) {
        await logActivity({
          userId,
          action: "UPDATE_LEAD_STATUS",
          entityId: id,
          entityType: "LEAD",
          details: { oldStatus: lead.status, newStatus: status, leadName: lead.name }
        });
      }
    }
    if (name !== undefined) {
      data.name = name;
    }
    if (phone !== undefined) {
      data.phone = phone;
    }
    if (details !== undefined) {
      data.details = details;
    }
    if (nextContactDate !== undefined) {
      data.nextContactDate = nextContactDate ? new Date(nextContactDate) : null;
    }
    if (source !== undefined) {
      data.source = source;
    }

    if (comment !== undefined) {
      const existingComments = JSON.parse(lead.comments || "[]");
      const newCommentObj = {
        text: comment,
        author: session?.user?.name || "Менеджер",
        createdAt: new Date().toISOString(),
      };
      data.comments = JSON.stringify([...existingComments, newCommentObj]);
      
      if (userId) {
        await logActivity({
          userId,
          action: "ADD_LEAD_COMMENT",
          entityId: id,
          entityType: "LEAD",
          details: { comment: comment, leadName: lead.name }
        });
      }
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

export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    const { id } = await params;
    const lead = await prisma.lead.findUnique({ where: { id } });
    
    await prisma.lead.delete({ where: { id } });
    
    if (userId && lead) {
      await logActivity({
        userId,
        action: "DELETE_LEAD",
        entityId: id,
        entityType: "LEAD",
        details: { leadName: lead.name, leadPhone: lead.phone }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Lead CRM Error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}

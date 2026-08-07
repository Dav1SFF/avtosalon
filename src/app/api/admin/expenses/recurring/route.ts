import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expenses = await prisma.recurringExpense.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch recurring expenses", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const expense = await prisma.recurringExpense.create({
      data: {
        category: data.category,
        amount: Number(data.amount),
        dayOfMonth: Number(data.dayOfMonth),
        note: data.note || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to create recurring expense", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.recurringExpense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recurring expense", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const expense = await prisma.recurringExpense.update({
      where: { id: data.id },
      data: {
        isActive: data.isActive
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to update recurring expense", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

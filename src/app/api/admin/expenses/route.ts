import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let whereClause = {};

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 1);
    whereClause = {
      date: {
        gte: startDate,
        lt: endDate
      }
    };
  }

  try {
    const expenses = await prisma.globalExpense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const expense = await prisma.globalExpense.create({
      data: {
        category: data.category,
        amount: Number(data.amount),
        date: new Date(data.date),
        note: data.note || ""
      }
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Failed to create expense", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
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

    await prisma.globalExpense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete expense", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}

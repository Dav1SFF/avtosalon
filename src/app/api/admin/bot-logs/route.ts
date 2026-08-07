import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "50");
    const page = Number(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.botLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.botLog.count()
    ]);

    return NextResponse.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Failed to fetch bot logs", error);
    return NextResponse.json({ error: "Failed to fetch bot logs" }, { status: 500 });
  }
}

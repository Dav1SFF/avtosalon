import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("GET Team Error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

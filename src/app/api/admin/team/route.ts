import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";



export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        salary: true,
        commissionRate: true,
      },
      orderBy: { name: 'asc' }
    });

    // We can also fetch their sales for the current month, or handle it in the UI by fetching cars.
    // Let's fetch their cars sold this month directly.
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let carsFilter: any = { status: "SOLD" };
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1);
      carsFilter.soldAt = {
        gte: startDate,
        lt: endDate
      };
    }

    const soldCars = await prisma.car.findMany({
      where: carsFilter,
      select: {
        id: true,
        soldById: true,
        salePrice: true,
        buyPrice: true,
        expenses: true,
        make: true,
        model: true,
      }
    });

    // Map sales to users
    const usersWithStats = users.map(user => {
      const userSales = soldCars.filter(car => car.soldById === user.id);
      
      let totalBonus = 0;
      userSales.forEach(car => {
        const salePrice = car.salePrice || 0;
        const buyPrice = car.buyPrice || 0;
        const expenses = car.expenses || 0;
        const profit = salePrice - buyPrice - expenses;
        if (profit > 0) {
          totalBonus += (profit * user.commissionRate) / 100;
        }
      });

      return {
        ...user,
        salesCount: userSales.length,
        totalBonus: Math.round(totalBonus),
        sales: userSales
      };
    });

    return NextResponse.json(usersWithStats);
  } catch (error) {
    console.error("Failed to fetch team", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: {
        salary: Number(data.salary),
        commissionRate: Number(data.commissionRate),
        role: data.role
      }
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

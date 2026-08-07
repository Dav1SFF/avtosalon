import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


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
        avatar: true,
        telegramId: true,
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
        createdById: true,
        salePrice: true,
        buyPrice: true,
        expenses: true,
        make: true,
        model: true,
      }
    });

    const allCarsCreatedThisMonth = await prisma.car.findMany({
      where: {
        createdAt: carsFilter.soldAt ? carsFilter.soldAt : undefined
      },
      select: {
        id: true,
        createdById: true
      }
    });

    // Map sales to users
    const usersWithStats = users.map(user => {
      const userSales = soldCars.filter(car => car.soldById === user.id);
      const userUploads = allCarsCreatedThisMonth.filter(car => car.createdById === user.id);
      
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
        uploadedCarsCount: userUploads.length,
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
    const updateData: any = {
      salary: Number(data.salary),
      commissionRate: Number(data.commissionRate),
      role: data.role,
      name: data.name,
      email: data.email,
    };
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.telegramId !== undefined) updateData.telegramId = data.telegramId;
    if (data.password) {
      updateData.password = bcrypt.hashSync(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: data.id },
      data: updateData
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return NextResponse.json({ error: "Користувач з таким email вже існує" }, { status: 400 });
    }

    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "MANAGER",
        salary: Number(data.salary) || 0,
        commissionRate: Number(data.commissionRate) || 0,
        avatar: data.avatar || null,
        telegramId: data.telegramId || null,
      }
    });

    const { password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");
    if (!userId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // First, unlink cars that point to this user
    await prisma.car.updateMany({
      where: { soldById: userId },
      data: { soldById: null }
    });
    await prisma.car.updateMany({
      where: { createdById: userId },
      data: { createdById: null }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

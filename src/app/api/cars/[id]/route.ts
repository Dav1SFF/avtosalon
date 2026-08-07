import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const car = await prisma.car.findUnique({ where: { id } });
    
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    return NextResponse.json({ car });
  } catch (error: any) {
    console.error("GET Car Error:", error);
    return NextResponse.json({ error: "Failed to fetch car" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const body = await request.json();

    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Convert fields to correct type if supplied
    const updateData: any = {};
    if (body.make !== undefined) updateData.make = body.make;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.price !== undefined) updateData.price = parseInt(body.price);
    if (body.year !== undefined) updateData.year = parseInt(body.year);
    if (body.mileage !== undefined) updateData.mileage = parseInt(body.mileage);
    if (body.engine !== undefined) updateData.engine = body.engine;
    if (body.transmission !== undefined) updateData.transmission = body.transmission;
    if (body.drive !== undefined) updateData.drive = body.drive;
    if (body.body !== undefined) updateData.body = body.body;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.images !== undefined) {
      updateData.images = typeof body.images === "string" ? body.images : JSON.stringify(body.images);
    }
    if (body.specs !== undefined) {
      updateData.specs = typeof body.specs === "string" ? body.specs : JSON.stringify(body.specs);
    }
    if (body.equipment !== undefined) {
      updateData.equipment = typeof body.equipment === "string" ? body.equipment : JSON.stringify(body.equipment);
    }
    if (body.serviceHistory !== undefined) {
      updateData.serviceHistory = typeof body.serviceHistory === "string" ? body.serviceHistory : JSON.stringify(body.serviceHistory);
    }
    if (body.buyPrice !== undefined) {
      updateData.buyPrice = body.buyPrice !== null ? parseInt(body.buyPrice) : null;
    }
    if (body.expenses !== undefined) {
      updateData.expenses = body.expenses !== null ? parseInt(body.expenses) : null;
    }
    if (body.source !== undefined) {
      updateData.source = body.source;
    }
    if (body.expenseLog !== undefined) {
      updateData.expenseLog = typeof body.expenseLog === "string" ? body.expenseLog : JSON.stringify(body.expenseLog);
    }

    const updatedCar = await prisma.car.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, car: updatedCar });
  } catch (error: any) {
    console.error("PUT Car Error:", error);
    return NextResponse.json({ error: "Failed to update car" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    
    const car = await prisma.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    await prisma.car.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Car Error:", error);
    return NextResponse.json({ error: "Failed to delete car" }, { status: 500 });
  }
}

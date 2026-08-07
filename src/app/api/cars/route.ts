import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Filter Parameters
    const make = searchParams.get("make") || undefined;
    const model = searchParams.get("model") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const minYear = searchParams.get("minYear") ? parseInt(searchParams.get("minYear")!) : undefined;
    const maxYear = searchParams.get("maxYear") ? parseInt(searchParams.get("maxYear")!) : undefined;
    const maxMileage = searchParams.get("maxMileage") ? parseInt(searchParams.get("maxMileage")!) : undefined;
    const transmission = searchParams.get("transmission") || undefined;
    const engine = searchParams.get("engine") || undefined;
    const body = searchParams.get("body") || undefined;
    const color = searchParams.get("color") || undefined;
    const search = searchParams.get("search") || "";
    
    // Sort and Pagination
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "8");
    const skip = (page - 1) * limit;

    const includePending = searchParams.get("includePending") === "true";

    const where: any = {};
    if (!includePending) {
      where.status = { not: "PENDING" };
    }

    if (make && make !== "all") where.make = { equals: make };
    if (model) where.model = { contains: model };
    if (transmission && transmission !== "all") where.transmission = { equals: transmission };
    if (engine && engine !== "all") where.engine = { contains: engine };
    if (body && body !== "all") where.body = { equals: body };
    if (color) where.color = { equals: color };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minYear !== undefined || maxYear !== undefined) {
      where.year = {};
      if (minYear !== undefined) where.year.gte = minYear;
      if (maxYear !== undefined) where.year.lte = maxYear;
    }

    if (maxMileage !== undefined) {
      where.mileage = { lte: maxMileage };
    }

    if (search) {
      where.OR = [
        { make: { contains: search } },
        { model: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "priceAsc") orderBy = { price: "asc" };
    else if (sortBy === "priceDesc") orderBy = { price: "desc" };
    else if (sortBy === "yearDesc") orderBy = { year: "desc" };
    else if (sortBy === "mileageAsc") orderBy = { mileage: "asc" };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

    return NextResponse.json({
      cars,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error: any) {
    console.error("GET Cars API Error:", error);
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
  }
}

// Admin POST method to create a car
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      make,
      model,
      price,
      year,
      mileage,
      engine,
      transmission,
      drive,
      body: bodyType,
      color,
      description,
      images,
      specs,
      equipment,
      serviceHistory,
      status,
      buyPrice,
      expenses,
      expenseLog,
    } = body;

    if (!make || !model || !price || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const car = await prisma.car.create({
      data: {
        make,
        model,
        price: parseInt(price),
        year: parseInt(year),
        mileage: parseInt(mileage || 0),
        engine: engine || "2.0 бензин",
        transmission: transmission || "Автомат",
        drive: drive || "Повний привід",
        body: bodyType || "Седан",
        color: color || "Чорний",
        description: description || "",
        images: typeof images === "string" ? images : JSON.stringify(images || []),
        specs: typeof specs === "string" ? specs : JSON.stringify(specs || {}),
        equipment: typeof equipment === "string" ? equipment : JSON.stringify(equipment || []),
        serviceHistory: typeof serviceHistory === "string" ? serviceHistory : JSON.stringify(serviceHistory || []),
        status: status || "IN_STOCK",
        buyPrice: buyPrice ? parseInt(buyPrice) : null,
        expenses: expenses ? parseInt(expenses) : null,
        expenseLog: typeof expenseLog === "string" ? expenseLog : JSON.stringify(expenseLog || []),
      },
    });

    return NextResponse.json({ success: true, car });
  } catch (error: any) {
    console.error("POST Cars API Error:", error);
    return NextResponse.json({ error: "Failed to create car" }, { status: 500 });
  }
}

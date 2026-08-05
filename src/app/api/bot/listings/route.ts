import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    // Optional: Add simple secret check to prevent unauthorized spam
    // if (authHeader !== `Bearer ${process.env.BOT_SECRET_TOKEN}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const data = await req.json();
    console.log("📥 [BOT API] Отримано новий запит від бота:", data);

    const newCar = await prisma.car.create({
      data: {
        make: data.make || "Unknown",
        model: data.model || "Unknown",
        price: Number(data.price) || 0,
        year: Number(data.year) || new Date().getFullYear(),
        mileage: Number(data.mileage) || 0,
        engine: data.engine || "Не вказано",
        transmission: data.transmission || "Не вказано",
        drive: data.drive || "Не вказано",
        body: data.body || "Не вказано",
        color: data.color || "Не вказано",
        owners: data.owners || 1,
        images: JSON.stringify(data.photos || data.images || []),
        videoUrl: data.videoUrl || null,
        description: data.description || "",
        specs: JSON.stringify(data.specs || {}),
        equipment: JSON.stringify(data.equipment || []),
        serviceHistory: JSON.stringify(data.serviceHistory || []),
        status: "PENDING", // PENDING approval status
      },
    });

    return NextResponse.json({ success: true, car: newCar });
  } catch (error) {
    console.error("Error creating bot listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

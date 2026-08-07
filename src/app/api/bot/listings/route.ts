import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    // Optional: Add simple secret check to prevent unauthorized spam
    // if (authHeader !== `Bearer ${process.env.BOT_SECRET_TOKEN}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const data = await req.json();
    console.log("📥 [BOT API] Отримано новий запит від бота:", data);

    const telegramId = data.user_id ? String(data.user_id) : null;
    let createdById: string | null = null;
    let user = null;

    if (telegramId) {
      user = await prisma.user.findUnique({
        where: { telegramId }
      });
      if (user) {
        createdById = user.id;
      }
    }

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
        createdById,
      },
    });

    if (createdById && user) {
      await logActivity({
        userId: createdById,
        action: "CREATE_CAR",
        entityId: newCar.id,
        entityType: "CAR",
        details: { carName: `${newCar.make} ${newCar.model}`, source: "Telegram Bot", price: newCar.price }
      });
    }

    return NextResponse.json({ success: true, car: newCar });
  } catch (error) {
    console.error("Error creating bot listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

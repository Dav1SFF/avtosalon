import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      where: { status: "IN_STOCK" },
    });

    const siteUrl = process.env.NEXTAUTH_URL || "https://vidkrytyi.com.ua";

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<offers>
  ${cars.map(car => {
    let parsedImages: string[] = [];
    try { parsedImages = JSON.parse(car.images); } catch(e) {}
    
    return `
  <offer>
    <id>${car.id}</id>
    <make><![CDATA[${car.make}]]></make>
    <model><![CDATA[${car.model}]]></model>
    <year>${car.year}</year>
    <price>${car.price}</price>
    <currency>USD</currency>
    <description><![CDATA[${car.description}]]></description>
    <mileage>${car.mileage}</mileage>
    <images>
      ${parsedImages.map(img => `<image><![CDATA[${img}]]></image>`).join('\n      ')}
    </images>
    <url><![CDATA[${siteUrl}/catalog/${car.id}]]></url>
  </offer>`}).join('')}
</offers>`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (err) {
    console.error("Error generating OLX XML:", err);
    return new NextResponse("Error generating XML", { status: 500 });
  }
}

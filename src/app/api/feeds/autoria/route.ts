import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      where: { status: "IN_STOCK" },
    });

    const siteUrl = process.env.NEXTAUTH_URL || "https://vidkrytyi.com.ua";

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<auto_catalog>
  <creation_date>${new Date().toISOString()}</creation_date>
  ${cars.map(car => {
    let parsedImages: string[] = [];
    try { parsedImages = JSON.parse(car.images); } catch(e) {}
    
    return `
  <ad>
    <id>${car.id}</id>
    <mark><![CDATA[${car.make}]]></mark>
    <model><![CDATA[${car.model}]]></model>
    <year>${car.year}</year>
    <price>${car.price}</price>
    <currency>USD</currency>
    <engine><![CDATA[${car.engine}]]></engine>
    <transmission><![CDATA[${car.transmission}]]></transmission>
    <gear><![CDATA[${car.drive}]]></gear>
    <body_type><![CDATA[${car.body}]]></body_type>
    <color><![CDATA[${car.color}]]></color>
    <description><![CDATA[${car.description}]]></description>
    <mileage>${Math.floor(car.mileage / 1000)}</mileage>
    <photos>
      ${parsedImages.map(img => `<photo><![CDATA[${img}]]></photo>`).join('\n      ')}
    </photos>
    <url><![CDATA[${siteUrl}/catalog/${car.id}]]></url>
  </ad>`}).join('')}
</auto_catalog>`;

    return new NextResponse(xmlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (err) {
    console.error("Error generating AUTO.RIA XML:", err);
    return new NextResponse("Error generating XML", { status: 500 });
  }
}

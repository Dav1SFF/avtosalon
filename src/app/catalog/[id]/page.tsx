import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/PublicLayout";
import CarDetailsClient from "@/components/CarDetailsClient";
import type { Metadata } from "next";

export const revalidate = 60; // Cache detail page and revalidate every minute

interface Props {
  params: Promise<{ id: string }>;
}

// Dynamic SEO metadata generator
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });

  if (!car) {
    return {
      title: "Автомобіль не знайдено | VIDKRYTYI",
    };
  }

  const title = car.seoTitle || `${car.make} ${car.model} ${car.year} року - купити у Києві | VIDKRYTYI`;
  const desc = car.seoDescription || `Продаж ${car.make} ${car.model} (${car.year} р.) з пробігом ${car.mileage} км. Технічно справний, перевірений автомобіль. Купити в кредит, лізинг, трейд-ін.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "website",
      images: [
        {
          url: JSON.parse(car.images)[0] || "",
          width: 1200,
          height: 630,
          alt: `${car.make} ${car.model}`,
        },
      ],
    },
  };
}

export default async function CarDetailsPage({ params }: Props) {
  const { id } = await params;

  // Query database for car details
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car) {
    notFound();
  }

  // Fetch similar cars (same make or similar price range, excluding current car)
  const similarCars = await prisma.car.findMany({
    where: {
      status: "IN_STOCK",
      id: { not: car.id },
      OR: [
        { make: car.make },
        { price: { gte: car.price - 10000, lte: car.price + 10000 } }
      ]
    },
    take: 4,
  });

  const serializedCar = {
    id: car.id,
    make: car.make,
    model: car.model,
    price: car.price,
    year: car.year,
    mileage: car.mileage,
    engine: car.engine,
    transmission: car.transmission,
    drive: car.drive,
    body: car.body,
    color: car.color,
    status: car.status,
    images: car.images,
    videoUrl: car.videoUrl,
    description: car.description,
    specs: car.specs,
    equipment: car.equipment,
    serviceHistory: car.serviceHistory,
  };

  const serializedSimilarCars = similarCars.map((c) => ({
    id: c.id,
    make: c.make,
    model: c.model,
    price: c.price,
    year: c.year,
    mileage: c.mileage,
    engine: c.engine,
    transmission: c.transmission,
    drive: c.drive,
    body: c.body,
    color: c.color,
    status: c.status,
    images: c.images,
    videoUrl: c.videoUrl,
    description: c.description,
    specs: c.specs,
    equipment: c.equipment,
    serviceHistory: c.serviceHistory,
  }));

  // JSON-LD structured schema for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": `${car.make} ${car.model}`,
    "image": JSON.parse(car.images),
    "description": car.description,
    "brand": {
      "@type": "Brand",
      "name": car.make,
    },
    "modelDate": car.year.toString(),
    "vehicleTransmission": car.transmission,
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": car.mileage,
      "unitCode": "KMT",
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": car.price.toString(),
      "itemCondition": "https://schema.org/UsedCondition",
      "availability": car.status === "IN_STOCK" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <PublicLayout>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#071E1A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CarDetailsClient car={serializedCar} similarCars={serializedSimilarCars} />
        </div>
      </div>
    </PublicLayout>
  );
}

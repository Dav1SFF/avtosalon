import React from "react";
import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/PublicLayout";
import CatalogClient from "@/components/CatalogClient";

export const revalidate = 0; // Disable server caching for catalog to support dynamic search queries

interface PageProps {
  searchParams: Promise<{
    make?: string;
    model?: string;
    minPrice?: string;
    maxPrice?: string;
    minYear?: string;
    maxYear?: string;
    maxMileage?: string;
    transmission?: string;
    engine?: string;
    body?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Read raw search queries
  const make = params.make || undefined;
  const model = params.model || undefined;
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const minYear = params.minYear ? parseInt(params.minYear) : undefined;
  const maxYear = params.maxYear ? parseInt(params.maxYear) : undefined;
  const maxMileage = params.maxMileage ? parseInt(params.maxMileage) : undefined;
  const transmission = params.transmission || undefined;
  const engine = params.engine || undefined;
  const body = params.body || undefined;
  const sortBy = params.sortBy || "createdAt";
  const page = parseInt(params.page || "1");
  const limit = 8;
  const skip = (page - 1) * limit;

  // Build Prisma filter
  const where: any = {
    status: { not: "PENDING" }
  };
  if (make && make !== "all") where.make = { equals: make };
  if (model) where.model = { contains: model };
  if (transmission && transmission !== "all") where.transmission = { equals: transmission };
  if (engine && engine !== "all") where.engine = { contains: engine };
  if (body && body !== "all") where.body = { equals: body };

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

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "priceAsc") orderBy = { price: "asc" };
  else if (sortBy === "priceDesc") orderBy = { price: "desc" };
  else if (sortBy === "yearDesc") orderBy = { year: "desc" };
  else if (sortBy === "mileageAsc") orderBy = { mileage: "asc" };

  // Run DB counts and fetch
  const [cars, total, makesData, bodiesData, transmissionsData] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.car.count({ where }),
    prisma.car.findMany({ select: { make: true }, distinct: ["make"], where: { status: { not: "PENDING" } } }),
    prisma.car.findMany({ select: { body: true }, distinct: ["body"], where: { status: { not: "PENDING" } } }),
    prisma.car.findMany({ select: { transmission: true }, distinct: ["transmission"], where: { status: { not: "PENDING" } } }),
  ]);

  const uniqueMakes = makesData.map(m => m.make).filter(Boolean);
  const uniqueBodies = bodiesData.map(b => b.body).filter(Boolean);
  const uniqueTransmissions = transmissionsData.map(t => t.transmission).filter(Boolean);

  // Convert schema objects to simple JSON serializable structures
  const serializedCars = cars.map((car) => ({
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
    description: car.description,
    isNew: car.isNew,
  }));

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-bold text-brand uppercase tracking-widest">Каталог</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 uppercase">
              Каталог <span className="text-brand">автомобілів</span>
            </h1>
          </div>

          <CatalogClient
            initialCars={serializedCars}
            initialTotal={total}
            initialPages={Math.ceil(total / limit)}
            initialPage={page}
            uniqueMakes={uniqueMakes}
            uniqueBodies={uniqueBodies}
            uniqueTransmissions={uniqueTransmissions}
          />
        </div>
      </div>
    </PublicLayout>
  );
}

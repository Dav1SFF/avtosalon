import React from "react";
import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/PublicLayout";
import ReviewsClient from "@/components/ReviewsClient";

export const revalidate = 0; // Dynamic page

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  const serializedReviews = reviews.map((r) => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand uppercase tracking-widest block mb-2">Відгуки</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase leading-tight font-sans">
              Що говорять <span className="text-brand">про нас</span>
            </h1>
          </div>

          <ReviewsClient initialReviews={serializedReviews} />

        </div>
      </div>
    </PublicLayout>
  );
}

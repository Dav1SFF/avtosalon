"use client";

import React, { useState } from "react";
import { Star, CheckCircle, Send, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsClientProps {
  initialReviews: Review[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  
  // Submit states
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        // Prepend to UI list
        setReviews([data.review, ...reviews]);
        // Reset states
        setName("");
        setRating(5);
        setComment("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left side: List of reviews */}
      <div className="lg:col-span-7 space-y-6">
        <h2 className="text-white text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand" />
          Відгуки покупців ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="glass p-10 rounded-[24px] text-center text-text-gray">
            Немає відгуків. Залиште свій відгук першим!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="glass p-6 sm:p-8 rounded-[24px] border border-white/5 space-y-4 hover:border-white/10 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{rev.name}</span>
                  <div className="flex gap-1 text-brand">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-gray italic leading-relaxed">
                  "{rev.comment}"
                </p>
                <span className="text-[10px] text-text-gray/40 block mt-2">
                  {new Date(rev.createdAt).toLocaleDateString("uk-UA")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Leave a review form */}
      <div className="lg:col-span-5 glass p-8 rounded-[24px] border border-white/5 shadow-xl space-y-6">
        <h3 className="text-white font-bold text-lg uppercase tracking-wide">Залишити відгук</h3>

        {success ? (
          <div className="p-6 bg-brand/10 border border-brand/20 rounded-xl text-center space-y-3 animate-fadeIn">
            <CheckCircle className="w-8 h-8 text-brand mx-auto" />
            <p className="text-white font-bold text-sm">Відгук успішно опубліковано!</p>
            <p className="text-xs text-text-gray">Дякуємо за вашу оцінку нашої роботи!</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-2 text-brand text-xs font-bold underline"
            >
              Написати ще один
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Ваше Ім'я</label>
              <input
                type="text"
                required
                placeholder="Введіть ім'я"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full premium-input"
              />
            </div>

            {/* Rating Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Ваша оцінка</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-brand hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= rating ? "fill-current" : "text-text-gray/35"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Ваш відгук</label>
              <textarea
                required
                placeholder="Поділіться враженнями про купівлю чи обслуговування у нашому салоні..."
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full premium-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
            >
              {loading ? "Надсилання..." : "Опублікувати відгук"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

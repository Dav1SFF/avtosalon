"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import { useApp } from "@/context/AppContext";
import { Heart, RefreshCw, Trash2, ArrowRight } from "lucide-react";

interface Car {
  id: string;
  make: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  engine: string;
  transmission: string;
  drive: string;
  body: string;
  color: string;
  images: string;
}

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useApp();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavoriteCars = async () => {
      if (favorites.length === 0) {
        setCars([]);
        return;
      }
      setLoading(true);
      try {
        // Fetch all cars and filter favorites client side
        const res = await fetch("/api/cars?limit=100");
        const data = await res.json();
        if (data.cars) {
          const filtered = data.cars.filter((c: Car) => favorites.includes(c.id));
          setCars(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteCars();
  }, [favorites]);

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest">Вибір</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 uppercase">
              Обрані <span className="text-brand">автомобілі</span>
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="w-10 h-10 text-brand animate-spin" />
            </div>
          ) : cars.length === 0 ? (
            <div className="glass p-16 rounded-[24px] border border-white/5 text-center text-text-gray space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-white uppercase tracking-wide">У вас немає обраних авто</p>
                <p className="text-xs text-text-gray mt-1">Додавайте автомобілі з каталогу, щоб повернутися до них пізніше</p>
              </div>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand text-background font-bold text-xs uppercase tracking-wider hover:bg-brand-hover transition"
              >
                <span>Перейти до каталогу</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cars.map((car) => {
                const carImages = JSON.parse(car.images);
                return (
                  <div
                    key={car.id}
                    className="bg-[#0E2A24] rounded-[24px] overflow-hidden border border-white/5 hover:border-brand/10 transition-all flex flex-col group h-full shadow-lg relative"
                  >
                    {/* Delete button overlay */}
                    <button
                      onClick={() => toggleFavorite(car.id)}
                      className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/45 hover:bg-brand hover:text-background text-red-500 border border-white/5 transition"
                      title="Видалити з обраного"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                      <Image
                        src={carImages[0] || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400"}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Car specs */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                        {car.make} {car.model}
                      </h3>
                      
                      <p className="text-xs text-text-gray mb-4">
                        {car.year} рік  •  {car.engine}  •  {car.transmission}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-[#A8B0AF] bg-[#071E1A]/40 p-3 rounded-xl border border-white/5">
                        <div>
                          <span className="block text-[10px] text-text-gray/50 uppercase">Привід</span>
                          <span className="font-semibold text-white">{car.drive}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-text-gray/50 uppercase">Пробіг</span>
                          <span className="font-semibold text-white">{(car.mileage / 1000).toFixed(0)} тис. км</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                        <div>
                          <span className="block text-[10px] text-text-gray/50 uppercase">Ціна</span>
                          <span className="text-brand font-extrabold text-xl">{car.price.toLocaleString("uk-UA")} $</span>
                        </div>

                        <Link
                          href={`/catalog/${car.id}`}
                          className="px-5 py-2.5 rounded-xl border border-brand/40 text-brand text-xs font-semibold hover:bg-brand hover:text-background transition-all duration-300"
                        >
                          Детальніше
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}

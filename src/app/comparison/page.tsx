"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PublicLayout from "@/components/PublicLayout";
import { useApp } from "@/context/AppContext";
import { GitCompare, Trash2, ArrowRight, RefreshCw, X } from "lucide-react";

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
  specs: string;
  equipment: string;
}

export default function ComparisonPage() {
  const { comparison, toggleCompare, clearCompare } = useApp();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComparedCars = async () => {
      if (comparison.length === 0) {
        setCars([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/cars?limit=100");
        const data = await res.json();
        if (data.cars) {
          const filtered = data.cars.filter((c: Car) => comparison.includes(c.id));
          setCars(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparedCars();
  }, [comparison]);

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-widest">Порівняння</span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 uppercase">
                Порівняння <span className="text-brand">автомобілів</span>
              </h1>
            </div>
            {cars.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-5 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 text-xs font-bold uppercase transition"
              >
                Очистити все
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <RefreshCw className="w-10 h-10 text-brand animate-spin" />
            </div>
          ) : cars.length === 0 ? (
            <div className="glass p-16 rounded-[24px] border border-white/5 text-center text-text-gray space-y-6">
              <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
                <GitCompare className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-white uppercase tracking-wide">Немає обраних авто для порівняння</p>
                <p className="text-xs text-text-gray mt-1">Додайте до 4 автомобілів з каталогу для порівняння характеристик</p>
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
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[800px] bg-[#0E2A24] rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
                
                {/* Table Header Row (Images & Names) */}
                <div className="grid grid-cols-5 border-b border-white/5">
                  <div className="p-6 flex items-center justify-center bg-black/10 border-r border-white/5 text-xs text-text-gray uppercase tracking-wider font-semibold">
                    Характеристики
                  </div>
                  {cars.map((car) => {
                    const imgs = JSON.parse(car.images);
                    return (
                      <div key={car.id} className="p-6 border-r border-white/5 relative group last:border-r-0">
                        {/* Remove button */}
                        <button
                          onClick={() => toggleCompare(car.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-500 hover:text-white text-text-gray transition"
                          title="Видалити"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-black/40">
                          <Image src={imgs[0]} alt={car.model} fill className="object-cover" />
                        </div>
                        
                        <h4 className="text-white font-bold text-sm leading-snug line-clamp-1">{car.make} {car.model}</h4>
                        <span className="text-brand font-extrabold text-base mt-2 block">{car.price.toLocaleString("uk-UA")} $</span>
                      </div>
                    );
                  })}
                  {/* Fill empty columns if less than 4 compared */}
                  {Array.from({ length: 4 - cars.length }).map((_, idx) => (
                    <div key={idx} className="p-6 border-r border-white/5 flex flex-col items-center justify-center text-text-gray/25 last:border-r-0">
                      <span>Додати ще авто</span>
                    </div>
                  ))}
                </div>

                {/* Compare Spec Rows */}
                {[
                  { label: "Рік випуску", key: "year" },
                  { label: "Пробіг, км", key: "mileage", format: (v: number) => v.toLocaleString("uk-UA") },
                  { label: "Двигун", key: "engine" },
                  { label: "Коробка передач", key: "transmission" },
                  { label: "Привід", key: "drive" },
                  { label: "Тип кузова", key: "body" },
                  { label: "Колір", key: "color" },
                ].map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 border-b border-white/5 hover:bg-white/1">
                    <div className="p-4 bg-black/10 border-r border-white/5 font-semibold text-xs text-text-gray uppercase tracking-wider flex items-center">
                      {row.label}
                    </div>
                    {cars.map((car) => {
                      const val = (car as any)[row.key];
                      return (
                        <div key={car.id} className="p-4 border-r border-white/5 text-sm font-semibold text-white flex items-center last:border-r-0">
                          {row.format ? row.format(val) : val}
                        </div>
                      );
                    })}
                    {Array.from({ length: 4 - cars.length }).map((_, idx) => (
                      <div key={idx} className="p-4 border-r border-white/5 last:border-r-0 bg-transparent" />
                    ))}
                  </div>
                ))}

                {/* Action button row */}
                <div className="grid grid-cols-5 bg-black/10">
                  <div className="p-4 border-r border-white/5" />
                  {cars.map((car) => (
                    <div key={car.id} className="p-4 border-r border-white/5 text-center last:border-r-0">
                      <Link
                        href={`/catalog/${car.id}`}
                        className="inline-block px-4 py-2 border border-brand/40 hover:bg-brand hover:text-background text-brand text-xs font-bold uppercase rounded-lg transition"
                      >
                        Переглянути
                      </Link>
                    </div>
                  ))}
                  {Array.from({ length: 4 - cars.length }).map((_, idx) => (
                    <div key={idx} className="p-4 border-r border-white/5 last:border-r-0" />
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
}

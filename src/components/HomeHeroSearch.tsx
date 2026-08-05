"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

export default function HomeHeroSearch({ uniqueMakes = [] }: { uniqueMakes?: string[] }) {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const makes = uniqueMakes.length > 0 ? uniqueMakes : ["BMW", "Volkswagen", "Alfa Romeo", "Infiniti", "Porsche"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (minYear) params.set("minYear", minYear);
    if (maxPrice) params.set("maxPrice", maxPrice);
    
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto glass p-6 rounded-[24px] shadow-2xl border border-white/5 relative z-10"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-text-gray font-semibold">Марка</label>
          <div className="relative">
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full appearance-none premium-input pr-10"
            >
              <option value="">Всі марки</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray pointer-events-none" />
          </div>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-text-gray font-semibold">Рік від</label>
          <div className="relative">
            <select
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              className="w-full appearance-none premium-input pr-10"
            >
              <option value="">Будь-який</option>
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-gray pointer-events-none" />
          </div>
        </div>

        {/* Price Limit */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wider text-text-gray font-semibold">Ціна до ($)</label>
          <input
            type="number"
            placeholder="Макс. ціна"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full premium-input"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-[12px] bg-brand text-background font-bold hover:bg-brand-hover transition-all duration-300 shadow-lg hover:shadow-brand/20 active:scale-95 text-sm uppercase tracking-wider"
        >
          <Search className="w-4 h-4" />
          <span>Пошук авто</span>
        </button>
      </div>
    </form>
  );
}

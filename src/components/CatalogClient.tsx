"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Heart, GitCompare, RotateCcw, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, Check, Eye } from "lucide-react";

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
  status: string;
  images: string;
  description: string;
  isNew: boolean;
}

interface CatalogClientProps {
  initialCars: Car[];
  initialTotal: number;
  initialPages: number;
  initialPage: number;
  uniqueMakes?: string[];
  uniqueBodies?: string[];
  uniqueTransmissions?: string[];
}

export default function CatalogClient({
  initialCars,
  initialTotal,
  initialPages,
  initialPage,
  uniqueMakes = [],
  uniqueBodies = [],
  uniqueTransmissions = [],
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleFavorite, isFavorite, toggleCompare, isInCompare } = useApp();

  // Filters State
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  // Filter criteria states
  const [make, setMake] = useState(searchParams.get("make") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "");
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "");
  const [maxMileage, setMaxMileage] = useState(searchParams.get("maxMileage") || "");
  const [transmission, setTransmission] = useState(searchParams.get("transmission") || "");
  const [engine, setEngine] = useState(searchParams.get("engine") || "");
  const [body, setBody] = useState(searchParams.get("body") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");

  const makes = uniqueMakes.length > 0 ? uniqueMakes : ["BMW", "Volkswagen", "Alfa Romeo", "Infiniti", "Porsche"];
  const transmissions = uniqueTransmissions.length > 0 ? uniqueTransmissions : ["Автомат", "Механіка"];
  const engines = ["бензин", "дизель", "Електро", "hybrid"];
  const bodies = uniqueBodies.length > 0 ? uniqueBodies : ["Седан", "Кросовер", "Купе", "Хетчбек"];

  const fetchFilteredCars = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (make) params.set("make", make);
      if (model) params.set("model", model);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minYear) params.set("minYear", minYear);
      if (maxYear) params.set("maxYear", maxYear);
      if (maxMileage) params.set("maxMileage", maxMileage);
      if (transmission) params.set("transmission", transmission);
      if (engine) params.set("engine", engine);
      if (body) params.set("body", body);
      if (sortBy) params.set("sortBy", sortBy);
      params.set("page", pageToFetch.toString());
      params.set("limit", "8");

      // Update URL query params without reloading the page
      router.replace(`/catalog?${params.toString()}`, { scroll: false });

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (data.cars) {
        setCars(data.cars);
        setTotal(data.total);
        setPages(data.pages);
        setCurrentPage(data.currentPage);
      }
    } catch (err) {
      console.error("Error filtering cars:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger filtering when criteria change
  useEffect(() => {
    fetchFilteredCars(1);
  }, [make, model, minPrice, maxPrice, minYear, maxYear, maxMileage, transmission, engine, body, sortBy]);

  const handleResetFilters = () => {
    setMake("");
    setModel("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setMaxMileage("");
    setTransmission("");
    setEngine("");
    setBody("");
    setSortBy("createdAt");
    router.replace("/catalog");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pages) {
      fetchFilteredCars(page);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar Filters */}
      <div className="lg:col-span-1 glass p-6 rounded-[24px] border border-white/5 self-start">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <span className="text-white font-bold flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand" />
            ФІЛЬТР
          </span>
          <button
            onClick={handleResetFilters}
            className="text-text-gray hover:text-brand text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Скинути все
          </button>
        </div>

        <div className="space-y-6">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Марка</label>
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full appearance-none premium-input font-medium"
            >
              <option value="">Всі марки</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Модель</label>
            <input
              type="text"
              placeholder="Назва моделі"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full premium-input"
            />
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Ціна, $</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Від"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full premium-input text-center"
              />
              <input
                type="number"
                placeholder="До"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full premium-input text-center"
              />
            </div>
          </div>

          {/* Year Range */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Рік випуску</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Від"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="w-full premium-input text-center"
              />
              <input
                type="number"
                placeholder="До"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                className="w-full premium-input text-center"
              />
            </div>
          </div>

          {/* Max Mileage */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Пробіг до, тис. км</label>
            <input
              type="number"
              placeholder="Макс. пробіг"
              value={maxMileage}
              onChange={(e) => setMaxMileage(e.target.value)}
              className="w-full premium-input"
            />
          </div>

          {/* Transmission */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Коробка передач</label>
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="w-full appearance-none premium-input font-medium"
            >
              <option value="">Всі</option>
              {transmissions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Engine / Fuel */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Тип двигуна</label>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              className="w-full appearance-none premium-input font-medium"
            >
              <option value="">Всі</option>
              {engines.map((eg) => (
                <option key={eg} value={eg}>
                  {eg}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-text-gray font-bold">Тип кузова</label>
            <select
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full appearance-none premium-input font-medium"
            >
              <option value="">Всі</option>
              {bodies.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Grid Section */}
      <div className="lg:col-span-3 space-y-6">
        {/* Sort and Count Info bar */}
        <div className="glass px-6 py-4 rounded-[24px] border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-text-gray text-sm">
            Знайдено <span className="text-white font-bold">{total}</span> автомобілів
          </span>

          <div className="flex items-center gap-3">
            <span className="text-text-gray text-xs uppercase tracking-wider font-semibold">Сортування:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="premium-input py-2 text-xs font-semibold appearance-none bg-[#0E2A24]/90 pr-8"
            >
              <option value="createdAt">Спочатку нові</option>
              <option value="priceAsc">Ціна: від дешевих</option>
              <option value="priceDesc">Ціна: від дорогих</option>
              <option value="yearDesc">Рік: новіші</option>
              <option value="mileageAsc">Пробіг: менший</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-[#0E2A24]/50 border border-white/5 rounded-[24px] h-[380px] animate-pulse" />
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="glass p-16 rounded-[24px] border border-white/5 text-center text-text-gray">
            <p className="text-lg font-semibold mb-2">Нічого не знайдено</p>
            <p className="text-sm">Спробуйте змінити параметри пошуку або скиньте фільтри</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {cars.map((car) => {
              const carImages = JSON.parse(car.images);
              const isFav = isFavorite(car.id);
              const inComp = isInCompare(car.id);

              return (
                <div
                  key={car.id}
                  className="bg-[#0E2A24] rounded-[24px] overflow-hidden border border-white/5 hover:border-brand/10 transition-all duration-300 flex flex-col group h-full shadow-lg relative"
                >
                  {/* Heart and Compare Action overlay buttons */}
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button
                      onClick={() => toggleFavorite(car.id)}
                      className={`p-2 rounded-xl transition-all duration-300 border ${
                        isFav
                          ? "bg-brand border-brand text-background"
                          : "bg-black/40 border-white/5 text-white hover:bg-black/60 hover:text-brand"
                      }`}
                      title={isFav ? "Видалити з обраного" : "Додати в обране"}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => toggleCompare(car.id)}
                      className={`p-2 rounded-xl transition-all duration-300 border ${
                        inComp
                          ? "bg-brand border-brand text-background"
                          : "bg-black/40 border-white/5 text-white hover:bg-black/60 hover:text-brand"
                      }`}
                      title={inComp ? "Видалити з порівняння" : "Додати до порівняння"}
                    >
                      <GitCompare className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Car Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                    <Image
                      src={carImages[0] || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {car.status !== "IN_STOCK" && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-4 py-2 bg-black/80 text-brand font-extrabold text-sm uppercase tracking-widest rounded-xl border border-brand/20">
                          {car.status === "BOOKED" ? "Бронь" : "Продано"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Car Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                      {car.make} {car.model}
                    </h3>
                    
                    <p className="text-xs text-text-gray mb-4">
                      {car.year} рік  •  {car.engine}  •  {car.transmission}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs text-text-gray bg-[#071E1A]/40 p-3 rounded-xl border border-white/5">
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

        {/* Pagination Controls */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-[#0E2A24] border border-white/5 text-white disabled:opacity-40 disabled:pointer-events-none hover:border-brand/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: pages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-11 h-11 rounded-xl text-sm font-bold border transition-all ${
                    currentPage === p
                      ? "bg-brand border-brand text-background"
                      : "bg-[#0E2A24] border-white/5 text-white hover:border-brand/20"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pages}
              className="p-3 rounded-xl bg-[#0E2A24] border border-white/5 text-white disabled:opacity-40 disabled:pointer-events-none hover:border-brand/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

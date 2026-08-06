"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, GitCompare, Phone, Send, Calendar, Check, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

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
  images: string; // JSON Array
  videoUrl?: string | null;
  description: string;
  specs: string; // JSON Object
  equipment: string; // JSON Array
  serviceHistory: string; // JSON Array
}

interface CarDetailsClientProps {
  car: Car;
  similarCars: Car[];
}

export default function CarDetailsClient({ car, similarCars }: CarDetailsClientProps) {
  const images = JSON.parse(car.images);
  const specs = JSON.parse(car.specs || "{}");
  const equipment = JSON.parse(car.equipment || "[]");
  const serviceHistory = JSON.parse(car.serviceHistory || "[]");

  const { toggleFavorite, isFavorite, toggleCompare, isInCompare } = useApp();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  


  // Booking Modal States
  const [bookingOpen, setBookingOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const isFav = isFavorite(car.id);
  const inComp = isInCompare(car.id);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setBookingLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BOOKING",
          name,
          phone,
          details: {
            carId: car.id,
            carName: `${car.make} ${car.model}`,
            carPrice: car.price,
          },
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setName("");
        setPhone("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Gallery and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full rounded-[24px] overflow-hidden border border-white/5 bg-black/40 group">
            <Image
              src={images[activeImageIdx]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Absolute navigation icons */}
            <button
              onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/40 text-white hover:bg-black/60 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/40 text-white hover:bg-black/60 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative aspect-[16/10] w-24 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                  activeImageIdx === idx ? "border-brand" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Quick facts / booking */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-8 rounded-[24px] border border-white/5 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider block mb-1">
                  {car.year} рік  •  {car.mileage.toLocaleString("uk-UA")} км
                </span>
                <h1 className="text-3xl font-extrabold text-white leading-tight uppercase font-sans">
                  {car.make} <span className="text-brand">{car.model}</span>
                </h1>
              </div>

              {/* Action Buttons Icons */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(car.id)}
                  className={`p-3 rounded-xl border transition ${
                    isFav
                      ? "bg-brand border-brand text-background"
                      : "border-white/5 text-white hover:bg-white/5"
                  }`}
                  title="Додати до обраного"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={() => toggleCompare(car.id)}
                  className={`p-3 rounded-xl border transition ${
                    inComp
                      ? "bg-brand border-brand text-background"
                      : "border-white/5 text-white hover:bg-white/5"
                  }`}
                  title="Додати до порівняння"
                >
                  <GitCompare className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Price display */}
            <div>
              <span className="text-xs text-text-gray/50 uppercase block mb-1">Вартість автомобіля</span>
              <span className="text-3xl font-extrabold text-brand tracking-wider font-sans">
                {car.price.toLocaleString("uk-UA")} $
              </span>
            </div>

            <div className="h-px bg-white/5" />

            {/* Quick specifications grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-[#071E1A]/40 border border-white/5 rounded-xl">
                <span className="text-[10px] text-text-gray/50 uppercase block">Двигун</span>
                <span className="font-semibold text-white">{car.engine}</span>
              </div>
              <div className="p-3 bg-[#071E1A]/40 border border-white/5 rounded-xl">
                <span className="text-[10px] text-text-gray/50 uppercase block">Трансмісія</span>
                <span className="font-semibold text-white">{car.transmission}</span>
              </div>
              <div className="p-3 bg-[#071E1A]/40 border border-white/5 rounded-xl">
                <span className="text-[10px] text-text-gray/50 uppercase block">Привід</span>
                <span className="font-semibold text-white">{car.drive}</span>
              </div>
              <div className="p-3 bg-[#071E1A]/40 border border-white/5 rounded-xl">
                <span className="text-[10px] text-text-gray/50 uppercase block">Колір</span>
                <span className="font-semibold text-white">{car.color}</span>
              </div>
            </div>

            {/* Action buttons CTAs */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-brand hover:bg-brand-hover text-background text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
              >
                <span>Забронювати автомобіль</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+380958009476"
                  className="flex items-center justify-center gap-2 py-3.5 border border-white/5 hover:border-brand text-white text-xs font-bold uppercase rounded-xl transition"
                >
                  <Phone className="w-4 h-4 text-brand" />
                  <span>Зателефонувати</span>
                </a>
                <a
                  href="https://t.me/avp_kyiv"
                  target="_blank"
                  className="flex items-center justify-center gap-2 py-3.5 border border-white/5 hover:border-brand text-white text-xs font-bold uppercase rounded-xl transition"
                >
                  <Send className="w-4 h-4 fill-current text-brand" />
                  <span>Написати у TG</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description and Characteristics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left specs list & Equipment list */}
        <div className="lg:col-span-8 space-y-12">
          {/* About vehicle */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-extrabold uppercase tracking-wide">Опис автомобіля</h3>
            <p className="text-sm text-text-gray leading-relaxed text-justify whitespace-pre-line bg-black/10 p-6 rounded-2xl border border-white/5">
              {car.description}
            </p>
          </div>

          {/* Characteristics */}
          {Object.keys(specs).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white text-xl font-extrabold uppercase tracking-wide">Технічні характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(specs).map(([key, value]) => {
                  const labelMap: Record<string, string> = {
                    engineVol: "Об'єм двигуна",
                    power: "Потужність двигуна",
                    acceleration: "Розгін 0-100 км/год",
                    maxSpeed: "Максимальна швидкість",
                    consumption: "Витрата пального",
                  };
                  return (
                    <div key={key} className="flex justify-between items-center py-3.5 px-4 bg-[#0E2A24] border border-white/5 rounded-xl">
                      <span className="text-xs text-text-gray">{labelMap[key] || key}</span>
                      <span className="text-sm font-semibold text-white">{value as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Equipment */}
          {equipment.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white text-xl font-extrabold uppercase tracking-wide">Комплектація автомобіля</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#0E2A24] p-8 rounded-3xl border border-white/5">
                {equipment.map((eq: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-text-gray">
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    <span>{eq}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right timeline for Service History */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-white text-xl font-extrabold uppercase tracking-wide">Історія обслуговування</h3>
          {serviceHistory.length > 0 ? (
            <div className="relative border-l border-white/10 pl-6 ml-2 space-y-8 py-4">
              {serviceHistory.map((history: any, idx: number) => (
                <div key={idx} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-9.5 top-1 bg-brand w-3.5 h-3.5 rounded-full ring-4 ring-[#071E1A]" />
                  <span className="text-xs text-brand font-bold block mb-1">
                    {history.date}  •  {history.mileage.toLocaleString("uk-UA")} км
                  </span>
                  <h4 className="text-white font-bold text-sm mb-1">{history.type}</h4>
                  <p className="text-xs text-text-gray leading-relaxed">{history.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass p-6 rounded-2xl text-center text-text-gray text-xs">
              Історія обслуговування автомобіля не завантажена. Подробиці дізнавайтеся у менеджерів салону.
            </div>
          )}
        </div>
      </div>

      {/* Similar Cars section */}
      {similarCars.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-white text-xl font-extrabold uppercase tracking-wide">Схожі автомобілі</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarCars.map((simCar) => {
              const simCarImgs = JSON.parse(simCar.images);
              return (
                <Link
                  key={simCar.id}
                  href={`/catalog/${simCar.id}`}
                  className="bg-[#0E2A24] border border-white/5 rounded-3xl overflow-hidden hover:border-brand/20 transition-all flex flex-col group"
                >
                  <div className="relative aspect-[16/10]">
                    <Image src={simCarImgs[0]} alt={simCar.model} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className="text-white font-bold line-clamp-1">{simCar.make} {simCar.model}</h4>
                    <p className="text-xs text-text-gray mt-1">{simCar.year} р.  •  {(simCar.mileage / 1000).toFixed(0)} тис. км</p>
                    <span className="text-brand font-bold mt-4 text-base block">{simCar.price.toLocaleString("uk-UA")} $</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass p-8 rounded-[24px] border border-white/5 max-w-md w-full relative space-y-6">
            <button
              onClick={() => {
                setBookingOpen(false);
                setBookingSuccess(false);
              }}
              className="absolute top-4 right-4 text-text-gray hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h3 className="text-white font-extrabold text-xl uppercase tracking-wide">Бронювання автомобіля</h3>
              <p className="text-xs text-text-gray mt-1">{car.make} {car.model} за {car.price.toLocaleString()} $</p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 bg-brand/10 border border-brand/20 rounded-xl text-center space-y-3">
                <span className="text-2xl">🎉</span>
                <p className="text-white font-bold text-sm">Заявка успішно надіслана!</p>
                <p className="text-xs text-text-gray">Наш менеджер зв'яжеться з вами найближчим часом для підтвердження броні.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
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
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Номер телефону</label>
                  <input
                    type="tel"
                    required
                    placeholder="+380"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full premium-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-3.5 bg-brand hover:bg-brand-hover text-background font-bold rounded-xl transition uppercase tracking-wider text-xs"
                >
                  {bookingLoading ? "Надсилання..." : "Підтвердити бронювання"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-brand hover:text-background text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-6 p-3 rounded-xl bg-white/10 text-white hover:bg-brand hover:text-background transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-[16/10] max-h-[80vh]">
            <Image
              src={images[activeImageIdx]}
              alt="Lightbox view"
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={() => setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-6 p-3 rounded-xl bg-white/10 text-white hover:bg-brand hover:text-background transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
}

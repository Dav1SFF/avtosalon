import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PublicLayout from "@/components/PublicLayout";
import HomeHeroSearch from "@/components/HomeHeroSearch";
import { CheckCircle2, ChevronRight, Phone, MapPin, Send, Star, HelpCircle, RefreshCcw } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  // Fetch cars for showcase
  const cars = await prisma.car.findMany({
    where: { status: "IN_STOCK" },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // Fetch approved reviews
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    take: 3,
  });

  // Fetch unique makes for filter
  const distinctCars = await prisma.car.findMany({
    where: { status: { not: "PENDING" } },
    select: { make: true },
    distinct: ["make"],
  });
  const uniqueMakes = distinctCars.map(c => c.make).filter(Boolean).sort();

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 bg-gradient-to-b from-[#071E1A] to-[#041210]">
        {/* Background Image of Luxury Vehicle */}
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1920"
            alt="Premium BMW Background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E1A] via-transparent to-[#071E1A]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero text content */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 uppercase leading-tight font-sans">
              Відкрито про <br />
              <span className="text-brand">автомобілі</span>
            </h1>

            {/* Bullets matching image mockup */}
            <ul className="space-y-4 mb-8 text-text-white text-sm sm:text-base font-medium">
              <li className="flex items-center gap-3">
                <span className="text-brand shrink-0">🤝</span>
                <span>Допомога у продажу  •  🔺 Автовикуп</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand shrink-0">💼</span>
                <span>Кредит  •  Лізинг  •  Trade-in  •  Обмін</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand shrink-0">🚙</span>
                <span>Більше 1000 проданих автомобілів</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand shrink-0">📍</span>
                <span className="text-text-gray">м. Київ, авторинок "Центральний"</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand shrink-0">📞</span>
                <span className="text-text-gray">(095) 800-94-76 або тг: @avp_kyiv</span>
              </li>
            </ul>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/catalog"
                className="flex items-center gap-2 px-8 py-4 rounded-[12px] bg-brand text-background font-bold hover:bg-brand-hover transition-all duration-300 shadow-lg hover:shadow-brand/20 active:scale-95 text-sm uppercase tracking-wider"
              >
                <span>Переглянути авто</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/trade-in"
                className="flex items-center gap-2 px-8 py-4 rounded-[12px] border border-brand/40 text-white font-bold hover:border-brand hover:bg-brand/5 transition-all duration-300 active:scale-95 text-sm uppercase tracking-wider"
              >
                <span>Оцінити своє авто</span>
              </Link>
            </div>
          </div>

          {/* Featured Car Hero Image Card */}
          <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl glass-light hidden sm:block">
            <Image
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800"
              alt="BMW 330i Showcase"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 glass px-4 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] text-brand uppercase font-bold tracking-wider">Пропозиція дня</span>
              <p className="text-sm font-bold text-white">BMW 330i G20 M Sport</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Quick Search Bar overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <HomeHeroSearch uniqueMakes={uniqueMakes} />
      </div>

      {/* 2. Feature highlights / Badges */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-[24px] border border-white/5 flex gap-4 hover:border-brand/20 transition-all duration-300">
            <div className="text-2xl shrink-0">🤝</div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Відкрито про автомобілі</h4>
              <p className="text-xs text-text-gray leading-relaxed">Прозорі умови та чесний підхід до кожного покупця.</p>
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-white/5 flex gap-4 hover:border-brand/20 transition-all duration-300">
            <div className="text-2xl shrink-0">🔄</div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Обмін / Trade-In</h4>
              <p className="text-xs text-text-gray leading-relaxed">Оцінимо ваше старе авто та запропонуємо найкращі умови.</p>
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-white/5 flex gap-4 hover:border-brand/20 transition-all duration-300">
            <div className="text-2xl shrink-0">🛡️</div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Перевірені автомобілі</h4>
              <p className="text-xs text-text-gray leading-relaxed">Всі автомобілі проходять повну технічну діагностику.</p>
            </div>
          </div>

          <div className="glass p-6 rounded-[24px] border border-white/5 flex gap-4 hover:border-brand/20 transition-all duration-300">
            <div className="text-2xl shrink-0">🚙</div>
            <div>
              <h4 className="text-white font-bold text-base mb-1">Понад 1000 проданих</h4>
              <p className="text-xs text-text-gray leading-relaxed">Багаторічна довіра покупців, якою ми дорожимо.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catalog Showcase */}
      <section className="py-16 bg-[#041210]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider block mb-2">Наявність</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
                Каталог <span className="text-brand">автомобілів</span>
              </h2>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider hover:bg-brand hover:text-background transition-all duration-300 active:scale-95"
            >
              <span>Дивитися всі авто</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car) => {
              const carImages = JSON.parse(car.images);
              return (
                <div
                  key={car.id}
                  className="bg-[#0E2A24] rounded-[24px] overflow-hidden border border-white/5 hover:border-brand/10 transition-all duration-300 flex flex-col group h-full shadow-lg"
                >
                  {/* Car Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                    <Image
                      src={carImages[0] || "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=400"}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-brand text-background text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md tracking-wider">
                      NEW
                    </div>
                  </div>

                  {/* Car Meta details */}
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
        </div>
      </section>

      {/* 4. CTA Forms Banners Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trade-In Banner */}
          <div className="relative rounded-[24px] overflow-hidden border border-white/5 glass p-10 flex flex-col justify-between min-h-[350px] group">
            <div className="absolute inset-0 z-0 opacity-10 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600')` }} />
            <div className="relative z-10">
              <span className="text-xs font-extrabold text-brand uppercase tracking-wider">Швидкий обмін</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4 uppercase">Trade-In обмін авто</h3>
              <p className="text-sm text-text-gray max-w-sm leading-relaxed">
                Обміняйте свій старий автомобіль на новий за 2 години. Ми запропонуємо чесну оціночну вартість вашої машини.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                href="/trade-in"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand text-background font-bold text-xs uppercase tracking-wider hover:bg-brand-hover transition"
              >
                <span>Заповнити заявку</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Buyback Banner */}
          <div className="relative rounded-[24px] overflow-hidden border border-white/5 glass p-10 flex flex-col justify-between min-h-[350px] group">
            <div className="absolute inset-0 z-0 opacity-10 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600')` }} />
            <div className="relative z-10">
              <span className="text-xs font-extrabold text-brand uppercase tracking-wider">Вигідна угода</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4 uppercase">Терміновий автовикуп</h3>
              <p className="text-sm text-text-gray max-w-sm leading-relaxed">
                Терміново потрібні гроші? Ми викупимо ваш автомобіль за 95% від ринкової вартості. Оцінка та виплата за 1 годину.
              </p>
            </div>
            <div className="relative z-10 pt-6">
              <Link
                href="/buyback"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-brand/30 text-brand font-bold text-xs uppercase tracking-wider hover:bg-brand hover:text-background transition"
              >
                <span>Продати автомобіль</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className="py-20 bg-[#041210]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand uppercase tracking-wider block mb-2">Відгуки</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
              Що говорять <span className="text-brand">клієнти</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="glass p-8 rounded-[24px] border border-white/5 flex flex-col h-full shadow-lg"
              >
                {/* Rating stars */}
                <div className="flex gap-1 text-brand mb-6">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-current" />
                  ))}
                </div>

                <p className="text-sm text-text-gray leading-relaxed flex-grow italic mb-6">
                  "{review.comment}"
                </p>

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-white font-bold text-sm">{review.name}</h4>
                  <span className="text-[10px] text-text-gray/50">Покупець VIDKRYTYI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

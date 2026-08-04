import React from "react";
import PublicLayout from "@/components/PublicLayout";
import Image from "next/image";

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand uppercase tracking-widest block mb-2">Про автосалон</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase leading-tight font-sans">
              Про компанію <span className="text-brand">VIDKRYTYI</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            {/* Description Text */}
            <div className="lg:col-span-6 space-y-6 text-sm text-text-gray leading-relaxed text-justify">
              <h2 className="text-2xl font-bold text-white uppercase">Наша філософія — повна відкритість</h2>
              <p>
                Автосалон <strong>VIDKRYTYI</strong> — це новий рівень продажу та обміну вживаних автомобілів в Україні. Наша місія — зробити покупку авто максимально прозорою, чесною та комфортною для кожного клієнта.
              </p>
              <p>
                Ми розуміємо, що покупка автомобіля — це важливе та відповідальне рішення. Саме тому кожен транспортний засіб у нашому каталозі проходить комплексну перевірку технічного стану, юридичної чистоти та реальності пробігу. Ми відкрито ділимося з клієнтами результатами діагностики та історією обслуговування.
              </p>
              <p>
                За роки успішної роботи ми допомогли більше ніж 1000 клієнтам знайти свої омріяні автомобілі, здійснили сотні швидких обмінів по програмі Trade-In та вигідних автовикупів. Ми пишаємося своєю репутацією та будуємо довгострокові стосунки, засновані на довірі.
              </p>
            </div>

            {/* Premium graphics image representation */}
            <div className="lg:col-span-6 relative aspect-[16/10] rounded-[24px] overflow-hidden border border-white/5 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800"
                alt="VIDKRYTYI Showroom"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Statistics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-12 border-t border-b border-white/5 text-center">
            <div>
              <span className="text-4xl sm:text-5xl font-extrabold text-brand block mb-2 font-sans">1000+</span>
              <span className="text-xs uppercase text-text-gray tracking-wider font-bold">Проданих авто</span>
            </div>
            <div>
              <span className="text-4xl sm:text-5xl font-extrabold text-brand block mb-2 font-sans">100%</span>
              <span className="text-xs uppercase text-text-gray tracking-wider font-bold">Перевірені пробіги</span>
            </div>
            <div>
              <span className="text-4xl sm:text-5xl font-extrabold text-brand block mb-2 font-sans">15 хв</span>
              <span className="text-xs uppercase text-text-gray tracking-wider font-bold">Швидка оцінка авто</span>
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}

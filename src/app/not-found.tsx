import React from "react";
import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="bg-[#071E1A] flex-grow flex items-center justify-center py-24">
        <div className="max-w-md w-full px-6 text-center space-y-6">
          <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Compass className="w-10 h-10 text-brand" />
          </div>
          
          <div>
            <span className="text-4xl font-extrabold text-brand tracking-widest block font-mono">404</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 uppercase tracking-wide">
              Сторінку не знайдено
            </h1>
            <p className="text-xs text-text-gray mt-2 leading-relaxed">
              Можливо, посилання застаріло або сторінку було перенесено. Скористайтеся посиланнями нижче, щоб повернутися до каталогу.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
            >
              <span>Каталог автомобілів</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="py-3.5 border border-white/5 hover:border-brand text-white text-xs font-bold uppercase rounded-xl transition"
            >
              На головну сторінку
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

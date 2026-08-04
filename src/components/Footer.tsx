"use client";

import React from "react";
import Link from "next/link";
import { Send, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/40 border-t border-border-custom pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-extrabold tracking-wider text-brand block leading-none">
                VIDKRYTYI
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-text-gray block mt-1 font-semibold">
                Відкрито про автомобілі
              </span>
            </Link>
            <p className="text-sm text-text-gray leading-relaxed max-w-xs mt-2">
              Продаж преміальних перевірених автомобілів в Україні. Чесні ціни, повна діагностика та високий рівень сервісу.
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h3 className="text-white text-base font-semibold tracking-wide mb-6 uppercase">Навігація</h3>
            <ul className="space-y-3.5">
              {[
                { name: "Каталог автомобілів", href: "/catalog" },
                { name: "Обмін / Trade-In", href: "/trade-in" },
                { name: "Терміновий Автовикуп", href: "/buyback" },
                { name: "Вигідний Лізинг", href: "/leasing" },
                { name: "Про компанію", href: "/about" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-text-gray hover:text-brand text-sm tracking-wide transition-colors duration-300 flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-white text-base font-semibold tracking-wide mb-6 uppercase">Графік роботи</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-text-gray">
                <Clock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Будні дні</span>
                  <span>09:00 - 19:00</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-text-gray">
                <Clock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-medium">Вихідні дні</span>
                  <span>10:00 - 18:00</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div>
            <h3 className="text-white text-base font-semibold tracking-wide mb-6 uppercase">Контакти</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-text-gray">
                <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <span>Київ, авторинок "Центральний" (Столичне шосе, 104)</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-gray">
                <Phone className="w-5 h-5 text-brand shrink-0" />
                <a href="tel:+380958009476" className="hover:text-brand transition-colors text-white font-semibold">
                  (095) 800-94-76
                </a>
              </li>
              <li className="flex gap-3.5 pt-2">
                <a
                  href="https://t.me/avp_kyiv"
                  target="_blank"
                  className="p-2.5 rounded-xl bg-white/5 border border-border-custom hover:border-brand hover:bg-brand hover:text-background transition-all duration-300"
                  title="Telegram"
                >
                  <Send className="w-5 h-5 fill-current" />
                </a>
                <a
                  href="https://instagram.com/avp_kyiv"
                  target="_blank"
                  className="p-2.5 rounded-xl bg-white/5 border border-border-custom hover:border-brand hover:bg-brand hover:text-background transition-all duration-300"
                  title="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-12 border-t border-border-custom flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-gray">
          <span>&copy; {currentYear} VIDKRYTYI. Всі права захищено.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand transition-colors">
              Політика конфиденциальності
            </Link>
            <Link href="/admin/login" className="hover:text-brand transition-colors">
              Для співробітників
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

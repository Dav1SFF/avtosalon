"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Heart, GitCompare, Menu, X, Phone, MapPin, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const { favorites, comparison } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Головна", href: "/" },
    { name: "Каталог авто", href: "/catalog" },
    { name: "Трейд-Ін", href: "/trade-in" },
    { name: "Автовикуп", href: "/buyback" },
    { name: "Лізинг", href: "/leasing" },
    { name: "Про нас", href: "/about" },
    { name: "Контакти", href: "/contacts" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-custom glass">
      {/* Top Banner on Desktop */}
      <div className="hidden lg:block border-b border-border-custom bg-black/20 py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs text-text-gray">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand" />
              м. Київ, авторинок "Центральний"
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand" />
              (095) 800-94-76
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Пн-Нд: 09:00 - 19:00</span>
            <span className="h-3 w-px bg-border-custom" />
            <Link href="/admin" className="hover:text-brand transition">
              Панель управління
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex flex-col justify-center">
            <Link href="/" className="group">
              <span className="text-2xl font-extrabold tracking-wider text-brand block leading-none font-sans">
                VIDKRYTYI
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-text-gray block mt-0.5 font-semibold group-hover:text-brand transition-colors duration-300">
                Відкрито про автомобілі
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-300 ${
                  isActive(item.href)
                    ? "bg-brand text-background font-semibold"
                    : "text-text-white hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Telegram CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Comparison Icon */}
            <Link
              href="/comparison"
              className="relative p-2 rounded-xl text-text-white hover:bg-white/5 transition group"
              title="Порівняння авто"
            >
              <GitCompare className="w-5.5 h-5.5 group-hover:text-brand transition-colors duration-300" />
              {comparison.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-background text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {comparison.length}
                </span>
              )}
            </Link>

            {/* Favorites Icon */}
            <Link
              href="/favorites"
              className="relative p-2 rounded-xl text-text-white hover:bg-white/5 transition group"
              title="Обране"
            >
              <Heart className="w-5.5 h-5.5 group-hover:text-brand transition-colors duration-300" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-background text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Telegram Button */}
            <Link
              href="https://t.me/avp_kyiv"
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 bg-brand text-background hover:bg-brand-hover shadow-lg hover:shadow-brand/20 active:scale-95"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Написати в Telegram</span>
            </Link>
          </div>

          {/* Mobile menu button & Icons */}
          <div className="flex md:hidden items-center gap-2">
            {/* Favorites Mobile Icon */}
            <Link
              href="/favorites"
              className="relative p-2 rounded-xl text-text-white"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand text-background text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border-custom bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition ${
                    isActive(item.href)
                      ? "bg-brand text-background font-semibold"
                      : "text-text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-border-custom my-4" />
              <div className="flex justify-between items-center px-4 py-2 text-sm text-text-gray">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" />
                  м. Київ, авторинок
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand" />
                  (095) 800-94-76
                </span>
              </div>
              <div className="pt-2 px-2">
                <Link
                  href="https://t.me/avp_kyiv"
                  target="_blank"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-base font-semibold bg-brand text-background hover:bg-brand-hover"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>Написати в Telegram</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Car, PhoneCall, Settings, LogOut, User, RefreshCw, Menu, X, Activity, Terminal } from "lucide-react";
import AccountSwitcher from "@/components/AccountSwitcher";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#071E1A]">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const navLinks = [
    { name: "Огляд (Dashboard)", href: "/admin", icon: LayoutDashboard },
    { name: "Автомобілі (CRUD)", href: "/admin/cars", icon: Car },
    { name: "Заявки (CRM)", href: "/admin/leads", icon: PhoneCall },
    ...(isAdmin ? [
      { name: "Загальні витрати", href: "/admin/expenses", icon: Settings },
      { name: "Команда (KPI)", href: "/admin/team", icon: User },
      { name: "Історія дій", href: "/admin/activity", icon: Activity },
      { name: "Логи бота", href: "/admin/bot-logs", icon: Terminal }
    ] : [])
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: `${window.location.origin}/admin/login` });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#071E1A] font-sans text-foreground selection:bg-brand selection:text-background relative">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0E2A24] border-b border-white/5 sticky top-0 z-40">
        <Link href="/" className="block">
          <span className="text-xl font-extrabold tracking-wider text-brand block leading-none">
            VIDKRYTYI
          </span>
          <span className="text-[8px] uppercase tracking-[0.2em] text-text-gray block mt-0.5 font-semibold">
            Адмін-панель
          </span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2 bg-white/5 rounded-lg border border-white/10">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0E2A24] border-r border-white/5 flex flex-col justify-between p-6 shrink-0 
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        
        {/* Branding header */}
        <div className="space-y-8">
          <div>
            <Link href="/" className="block">
              <span className="text-2xl font-extrabold tracking-wider text-brand block leading-none">
                VIDKRYTYI
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-text-gray block mt-0.5 font-semibold">
                Адмін-панель
              </span>
            </Link>
          </div>

          <div className="h-px bg-white/5" />

          {/* User Meta (Account Switcher) */}
          <AccountSwitcher session={session} />

          {/* Sidebar links */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-brand text-background font-semibold"
                      : "text-text-gray hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-4">
          <div className="h-px bg-white/5" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Вийти з кабінету</span>
          </button>
        </div>

      </aside>

      {/* Main dashboard content */}
      <main className="flex-grow p-4 sm:p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>

    </div>
  );
}

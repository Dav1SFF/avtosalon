"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Car, PhoneCall, Settings, LogOut, User, RefreshCw } from "lucide-react";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

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

  const navLinks = [
    { name: "Огляд (Dashboard)", href: "/admin", icon: LayoutDashboard },
    { name: "Автомобілі (CRUD)", href: "/admin/cars", icon: Car },
    { name: "Заявки (CRM)", href: "/admin/leads", icon: PhoneCall },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="min-h-screen flex bg-[#071E1A] font-sans text-foreground selection:bg-brand selection:text-background">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0E2A24] border-r border-white/5 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        
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

          {/* User Meta */}
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">
              {session.user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white truncate">{session.user?.name}</span>
              <span className="block text-[10px] text-text-gray/50 font-semibold truncate uppercase">
                {(session.user as any).role || "Менеджер"}
              </span>
            </div>
          </div>

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
      <main className="flex-grow p-10 overflow-y-auto max-h-screen">
        {children}
      </main>

    </div>
  );
}

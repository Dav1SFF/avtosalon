import React from "react";
import { prisma } from "@/lib/prisma";
import AdminChart from "@/components/AdminChart";
import { Car, PhoneCall, Star, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Dynamic view

export default async function AdminDashboardPage() {
  // Query database statistics
  const [totalCars, activeLeads, totalReviews, tradeInCount, buybackCount, bookingCount, contactCount] = await Promise.all([
    prisma.car.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.review.count(),
    prisma.lead.count({ where: { type: "TRADE_IN" } }),
    prisma.lead.count({ where: { type: "BUYBACK" } }),
    prisma.lead.count({ where: { type: "BOOKING" } }),
    prisma.lead.count({ where: { type: "CONTACT" } }),
  ]);

  // Fetch recent leads
  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  const chartData = [
    { name: "Trade-In", count: tradeInCount },
    { name: "Викуп", count: buybackCount },
    { name: "Бронювання", count: bookingCount },
    { name: "Зворотний зв'язок", count: contactCount },
  ];

  const typeLabels: Record<string, string> = {
    TRADE_IN: "Trade-In",
    BUYBACK: "Автовикуп",
    BOOKING: "Бронювання",
    CONTACT: "Контакти",
  };

  return (
    <div className="space-y-10">
      <div>
        <span className="text-xs font-bold text-brand uppercase tracking-wider">Панель огляду</span>
        <h1 className="text-3xl font-extrabold text-white mt-1 uppercase">Dashboard</h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Cars */}
        <div className="glass p-6 rounded-[24px] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-gray font-semibold uppercase tracking-wider block">Автомобілів</span>
            <span className="text-3xl font-extrabold text-white mt-2 block font-mono">{totalCars}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Active Leads */}
        <div className="glass p-6 rounded-[24px] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-gray font-semibold uppercase tracking-wider block">Нових заявок</span>
            <span className="text-3xl font-extrabold text-brand mt-2 block font-mono">{activeLeads}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        {/* Reviews */}
        <div className="glass p-6 rounded-[24px] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-gray font-semibold uppercase tracking-wider block">Відгуків</span>
            <span className="text-3xl font-extrabold text-white mt-2 block font-mono">{totalReviews}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
        </div>

        {/* Conversion placeholder */}
        <div className="glass p-6 rounded-[24px] border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs text-text-gray font-semibold uppercase tracking-wider block">Всього запитів</span>
            <span className="text-3xl font-extrabold text-white mt-2 block font-mono">
              {tradeInCount + buybackCount + bookingCount + contactCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recharts chart block */}
        <div className="lg:col-span-7">
          <AdminChart data={chartData} />
        </div>

        {/* Recent leads table */}
        <div className="lg:col-span-5 glass p-6 rounded-[24px] border border-white/5 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <h3 className="text-white font-bold text-base uppercase tracking-wider">Останні запити CRM</h3>
            <Link href="/admin/leads" className="text-brand hover:underline text-xs font-semibold flex items-center gap-1">
              CRM панель
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center text-xs text-text-gray py-8">Немає активних заявок</div>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5"
                >
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-white truncate">{lead.name}</span>
                    <span className="block text-[10px] text-text-gray/50 font-semibold uppercase mt-0.5">
                      {typeLabels[lead.type] || lead.type}  •  {lead.phone}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-1 rounded-md tracking-wider ${
                      lead.status === "NEW"
                        ? "bg-brand/10 text-brand border border-brand/20"
                        : "bg-white/5 text-text-gray border border-white/5"
                    }`}
                  >
                    {lead.status === "NEW" ? "Нова" : "Оброблена"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

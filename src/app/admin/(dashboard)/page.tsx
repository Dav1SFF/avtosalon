import React from "react";
import { prisma } from "@/lib/prisma";
import AdminChart from "@/components/AdminChart";
import { Car, PhoneCall, Star, FileText, ArrowUpRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import DashboardControls from "./DashboardControls";

export const revalidate = 0; // Dynamic view

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: { month?: string; year?: string };
}) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const currentDate = new Date();
  const month = searchParams?.month ? parseInt(searchParams.month) : currentDate.getMonth() + 1;
  const year = searchParams?.year ? parseInt(searchParams.year) : currentDate.getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const dateFilter = {
    gte: startDate,
    lt: endDate,
  };

  // Query database statistics
  const [totalCars, activeLeads, totalReviews, tradeInCount, buybackCount, bookingCount, contactCount, soldCars, inStockCars, globalExpenses] = await Promise.all([
    prisma.car.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.review.count(),
    prisma.lead.count({ where: { type: "TRADE_IN", createdAt: dateFilter } }),
    prisma.lead.count({ where: { type: "BUYBACK", createdAt: dateFilter } }),
    prisma.lead.count({ where: { type: "BOOKING", createdAt: dateFilter } }),
    prisma.lead.count({ where: { type: "CONTACT", createdAt: dateFilter } }),
    prisma.car.findMany({ where: { status: "SOLD", soldAt: dateFilter } }),
    prisma.car.findMany({ where: { status: "IN_STOCK" } }),
    prisma.globalExpense.findMany({ where: { date: dateFilter } }),
  ]);

  const realizedProfit = soldCars.reduce((acc, car) => {
    if (car.salePrice && car.buyPrice) {
      return acc + (car.salePrice - car.buyPrice - (car.expenses || 0));
    }
    return acc;
  }, 0);

  const totalCapital = inStockCars.reduce((acc, car) => acc + (car.buyPrice || 0), 0);
  const expectedProfit = inStockCars.reduce((acc, car) => {
    if (car.price && car.buyPrice) {
      return acc + (car.price - car.buyPrice - (car.expenses || 0));
    }
    return acc;
  }, 0);

  const totalExpensesAmount = globalExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const netProfit = realizedProfit - totalExpensesAmount;

  const stats = {
    totalCars, activeLeads, totalReviews, tradeInCount, buybackCount, bookingCount, contactCount,
    totalCapital, expectedProfit, realizedProfit, totalExpensesAmount, netProfit
  };

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
    <div className="space-y-10 animate-fadeIn">
      <div>
        <span className="text-xs font-bold text-brand uppercase tracking-wider">Панель огляду</span>
        <h1 className="text-3xl font-extrabold text-white mt-1 uppercase">Dashboard</h1>
      </div>

      <DashboardControls stats={stats} initialMonth={month} initialYear={year} />

      {/* Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${isAdmin ? '5' : '4'} gap-6`}>
        
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

        {/* Total Requests */}
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

        {/* P&L Analytics (Admin Only) */}
        {isAdmin && (
          <>
            <div className="glass p-6 rounded-[24px] border border-white/5 flex flex-col justify-between lg:col-span-2">
              <div>
                <span className="text-xs text-text-gray font-semibold uppercase tracking-wider block text-brand">Капітал в авто</span>
                <span className="text-3xl font-extrabold text-white mt-2 block font-mono">
                  ${totalCapital.toLocaleString("en-US")}
                </span>
                <span className="text-[10px] text-text-gray mt-1 block">Очікуваний прибуток: +${expectedProfit.toLocaleString("en-US")}</span>
              </div>
            </div>

            <div className="glass p-6 rounded-[24px] border border-brand/30 flex flex-col justify-between lg:col-span-2 bg-brand/5">
              <div>
                <span className="text-xs text-brand font-black uppercase tracking-wider block">Чистий Прибуток (P&L)</span>
                <div className="flex items-end gap-2 mt-2">
                  <span className={`text-4xl font-extrabold block font-mono ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${netProfit.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-text-gray uppercase tracking-widest border-t border-white/10 pt-2">
                  <span>З продажу: ${realizedProfit}</span>
                  <span className="text-red-400">Витрати: -${totalExpensesAmount}</span>
                </div>
              </div>
            </div>
          </>
        )}

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

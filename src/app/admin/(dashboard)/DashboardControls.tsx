"use client";

import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface DashboardControlsProps {
  stats: any;
  initialMonth: number;
  initialYear: number;
}

export default function DashboardControls({ stats, initialMonth, initialYear }: DashboardControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const handleFilterChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", m.toString());
    params.set("year", y.toString());
    router.push(`/admin?${params.toString()}`);
  };

  const downloadExcel = () => {
    const data = [
      ["Показник", "Значення"],
      ["Автомобілів в наявності", stats.totalCars],
      ["Нових заявок", stats.activeLeads],
      ["Відгуків", stats.totalReviews],
      ["Всього запитів (CRM)", stats.tradeInCount + stats.buybackCount + stats.bookingCount + stats.contactCount],
      ["Капітал в авто ($)", stats.totalCapital],
      ["Очікуваний прибуток ($)", stats.expectedProfit],
      ["Прибуток з продажу ($)", stats.realizedProfit],
      ["Витрати ($)", stats.totalExpensesAmount],
      ["Чистий Прибуток (P&L) ($)", stats.netProfit],
    ];
    
    // Import dynamically so it doesn't break SSR
    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Статистика");
      XLSX.writeFile(workbook, `statistics_${month}_${year}.xlsx`);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5 mt-6 mb-8 w-full max-w-3xl">
      <div className="flex gap-4 items-center w-full md:w-auto">
        <select 
          value={month} 
          onChange={(e) => handleFilterChange(Number(e.target.value), year)} 
          className="premium-input w-40"
        >
          {Array.from({length: 12}).map((_, i) => (
            <option key={i+1} value={i+1}>{format(new Date(2000, i, 1), 'LLLL', {locale: uk})}</option>
          ))}
        </select>
        <select 
          value={year} 
          onChange={(e) => handleFilterChange(month, Number(e.target.value))} 
          className="premium-input w-32"
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={downloadExcel} 
        className="md:ml-auto w-full md:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-brand hover:bg-brand-hover px-6 py-3 rounded-xl transition text-background uppercase tracking-wider"
      >
        <Download className="w-4 h-4" /> Експорт в Excel
      </button>
    </div>
  );
}

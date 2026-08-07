"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Plus, Trash2, Calendar, FileText, DollarSign, Tag, TrendingUp } from "lucide-react";

interface GlobalExpense {
  id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<GlobalExpense[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState("Офіс");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/expenses?month=${month}&year=${year}`);
      const data = await res.json();
      if (Array.isArray(data)) setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [month, year]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount, date, note })
      });
      if (res.ok) {
        setModalOpen(false);
        setAmount("");
        setNote("");
        fetchExpenses();
      } else {
        alert("Помилка збереження");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю витрату?")) return;
    try {
      await fetch(`/api/admin/expenses?id=${id}`, { method: "DELETE" });
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide uppercase">Загальні витрати</h1>
          <p className="text-text-gray mt-2">Операційні витрати компанії (оренда, реклама, зарплати)</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-background font-bold uppercase tracking-wider rounded-xl transition"
        >
          <Plus className="w-5 h-5" /> Додати витрату
        </button>
      </div>

      <div className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="premium-input w-40">
          {Array.from({length: 12}).map((_, i) => (
            <option key={i+1} value={i+1}>{format(new Date(2000, i, 1), 'LLLL', {locale: uk})}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="premium-input w-32">
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2 text-brand font-black text-xl">
          Всього: ${totalAmount}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-brand animate-pulse">Завантаження...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-20 text-text-gray bg-white/5 rounded-3xl border border-dashed border-white/10">
          За цей період витрат не знайдено
        </div>
      ) : (
        <div className="bg-[#0A1A17] rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-text-gray font-bold">
                <th className="p-4 pl-6">Дата</th>
                <th className="p-4">Категорія</th>
                <th className="p-4">Коментар</th>
                <th className="p-4 text-right">Сума</th>
                <th className="p-4 pr-6 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/5 transition group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Calendar className="w-4 h-4 text-brand" />
                      {format(new Date(expense.date), "dd.MM.yyyy")}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs text-text-gray font-semibold border border-white/10">
                      <Tag className="w-3 h-3" /> {expense.category}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-text-gray">
                      <FileText className="w-4 h-4 opacity-50" />
                      {expense.note}
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-red-400 text-lg">
                    -${expense.amount}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => handleDelete(expense.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0E2A24] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black text-white uppercase tracking-wide mb-6">Нова витрата</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Категорія</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="premium-input w-full">
                  <option value="Офіс та Оренда">Офіс та Оренда</option>
                  <option value="Реклама">Реклама</option>
                  <option value="Зарплати">Зарплати</option>
                  <option value="IT та Сервіси">IT та Сервіси</option>
                  <option value="Інше">Інше</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Сума ($)</label>
                <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="premium-input w-full text-white font-bold" placeholder="150" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Дата</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="premium-input w-full" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Коментар</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="premium-input w-full" placeholder="Наприклад: Оплата за інтернет" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-xl transition">
                  Скасувати
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-brand hover:bg-brand-hover text-background font-bold uppercase rounded-xl transition disabled:opacity-50">
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Plus, Trash2, Calendar, FileText, DollarSign, Tag, TrendingUp, Download, RefreshCw } from "lucide-react";

interface GlobalExpense {
  id: string;
  category: string;
  amount: number;
  date: string;
  note: string;
}

interface RecurringExpense {
  id: string;
  category: string;
  amount: number;
  dayOfMonth: number;
  note: string;
  isActive: boolean;
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
  const [activeTab, setActiveTab] = useState<"history" | "recurring">("history");

  // Recurring states
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [recModalOpen, setRecModalOpen] = useState(false);
  const [recDay, setRecDay] = useState(1);

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

  const fetchRecurring = async () => {
    try {
      const res = await fetch("/api/admin/expenses/recurring");
      const data = await res.json();
      if (Array.isArray(data)) setRecurring(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    if (activeTab === "recurring") {
      fetchRecurring();
    }
  }, [month, year, activeTab]);

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

  const handleRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/expenses/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount, dayOfMonth: recDay, note })
      });
      if (res.ok) {
        setRecModalOpen(false);
        setAmount("");
        setNote("");
        fetchRecurring();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecDelete = async (id: string) => {
    if (!confirm("Видалити регулярну витрату?")) return;
    try {
      await fetch(`/api/admin/expenses/recurring?id=${id}`, { method: "DELETE" });
      fetchRecurring();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/admin/expenses/recurring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive })
      });
      fetchRecurring();
    } catch (error) {
      console.error(error);
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const downloadExcel = () => {
    const data = [
      ["Дата", "Категорія", "Коментар", "Сума"],
      ...expenses.map(e => [
        format(new Date(e.date), "dd.MM.yyyy"),
        e.category,
        e.note,
        e.amount
      ])
    ];

    import('xlsx').then(XLSX => {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Витрати");
      XLSX.writeFile(workbook, `expenses_${month}_${year}.xlsx`);
    });
  };

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

      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button 
          onClick={() => setActiveTab("history")} 
          className={`pb-2 text-sm font-bold tracking-wider uppercase transition border-b-2 ${activeTab === "history" ? "border-brand text-brand" : "border-transparent text-text-gray hover:text-white"}`}
        >
          Історія витрат
        </button>
        <button 
          onClick={() => setActiveTab("recurring")} 
          className={`pb-2 text-sm font-bold tracking-wider uppercase transition border-b-2 ${activeTab === "recurring" ? "border-brand text-brand" : "border-transparent text-text-gray hover:text-white"}`}
        >
          Регулярні (Авто)
        </button>
      </div>

      {activeTab === "history" ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex gap-2 w-full sm:w-auto">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="premium-input flex-1 sm:w-40">
                {Array.from({length: 12}).map((_, i) => (
                  <option key={i+1} value={i+1}>{format(new Date(2000, i, 1), 'LLLL', {locale: uk})}</option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="premium-input w-24 sm:w-32">
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-4">
              <button onClick={downloadExcel} className="flex items-center justify-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg transition text-white uppercase tracking-wider flex-1 sm:flex-none">
                <Download className="w-4 h-4 text-brand" /> <span className="hidden sm:inline">Експорт</span>
              </button>

              <div className="flex items-center gap-2 text-brand font-black text-xl shrink-0">
                Всього: ${totalAmount}
              </div>
            </div>
          </div>

      {loading ? (
        <div className="text-center py-20 text-brand animate-pulse">Завантаження...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-20 text-text-gray bg-white/5 rounded-3xl border border-dashed border-white/10">
          За цей період витрат не знайдено
        </div>
      ) : (
        <div className="bg-transparent md:bg-[#0A1A17] md:rounded-3xl md:border border-white/5 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col gap-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Calendar className="w-4 h-4 text-brand" />
                    {format(new Date(expense.date), "dd.MM.yyyy")}
                  </div>
                  <div className="text-xl font-black text-red-400">-${expense.amount}</div>
                </div>
                <div className="mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-xs text-white font-semibold">
                    <Tag className="w-3 h-3" /> {expense.category}
                  </div>
                </div>
                {expense.note && (
                  <div className="text-sm text-text-gray bg-black/20 p-3 rounded-xl w-[calc(100%-40px)]">
                    <p className="italic">"{expense.note}"</p>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="absolute bottom-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-brand/5 p-6 rounded-3xl border border-brand/20">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Регулярні витрати</h2>
              <p className="text-sm text-text-gray">Ці витрати автоматично списуватимуться кожного вибраного числа місяця.</p>
            </div>
            <button onClick={() => setRecModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand text-background rounded-xl font-bold text-sm uppercase">
              <Plus className="w-4 h-4" /> Додати шаблон
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recurring.map(rec => (
              <div key={rec.id} className={`p-6 rounded-3xl border transition ${rec.isActive ? 'bg-[#0A1A17] border-white/10' : 'bg-black/40 border-white/5 opacity-60'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 text-xs text-text-gray font-semibold border border-white/10">
                    <Tag className="w-3 h-3" /> {rec.category}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRecToggle(rec.id, !rec.isActive)} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${rec.isActive ? 'text-brand bg-brand/10' : 'text-text-gray bg-white/5'}`}>
                      {rec.isActive ? 'Активно' : 'Пауза'}
                    </button>
                    <button onClick={() => handleRecDelete(rec.id)} className="text-red-500 bg-red-500/10 p-1.5 rounded hover:bg-red-500 hover:text-white">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-2">${rec.amount}</div>
                <div className="text-sm text-text-gray mb-4">{rec.note || "Без коментаря"}</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-brand bg-brand/5 px-3 py-2 rounded-lg">
                  <RefreshCw className="w-3 h-3" /> Списується {rec.dayOfMonth}-го числа
                </div>
              </div>
            ))}
          </div>
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

      {recModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0E2A24] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black text-white uppercase tracking-wide mb-6">Новий шаблон витрати</h3>
            
            <form onSubmit={handleRecSubmit} className="space-y-4">
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
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">День місяця для списання</label>
                <input type="number" min="1" max="28" required value={recDay} onChange={(e) => setRecDay(Number(e.target.value))} className="premium-input w-full" placeholder="1" />
                <span className="text-[10px] text-text-gray">Введіть число від 1 до 28</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Коментар</label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="premium-input w-full" placeholder="Наприклад: Оплата за інтернет" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setRecModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-xl transition">
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

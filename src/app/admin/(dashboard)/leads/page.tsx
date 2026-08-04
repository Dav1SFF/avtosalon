"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, Calendar, RefreshCcw, Send, MessageSquare, Shield, Clock, HelpCircle, X } from "lucide-react";

interface Lead {
  id: string;
  type: string;
  name: string;
  phone: string;
  details: string; // JSON
  status: string;
  comments: string; // JSON Array
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Comment Modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [commentText, setCommentText] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads?limit=100"); // Can reuse lead fetching endpoint or similar
      // Wait, we didn't write a GET endpoint for leads. Let's make sure our POST leads route also handles GET, or query it here.
      // Let's check: does `/api/leads` have a GET handler? No! Our `src/app/api/leads/route.ts` only had a POST handler.
      // Let's update `src/app/api/leads/route.ts` first to handle GET as well, which returns all leads sorted by date!
      // Let's fetch leads. Let's do that!
      const res2 = await fetch("/api/leads");
      const data = await res2.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !commentText) return;
    try {
      const res = await fetch(`/api/leads/${activeLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        setCommentModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (activeTab === "all") return true;
    return l.type === activeTab;
  });

  const typeLabels: Record<string, string> = {
    TRADE_IN: "🔄 Trade-In",
    BUYBACK: "💰 Викуп",
    BOOKING: "📅 Бронювання",
    CONTACT: "✉️ Контакти",
  };

  const statusColors: Record<string, string> = {
    NEW: "bg-brand/10 text-brand border-brand/20",
    IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const statusLabels: Record<string, string> = {
    NEW: "Нова",
    IN_PROGRESS: "В процесі",
    COMPLETED: "Виконано",
    REJECTED: "Відхилено",
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">Керування запитами клієнтів</span>
          <h1 className="text-3xl font-extrabold text-white mt-1 uppercase">Заявки (CRM)</h1>
        </div>
        <button
          onClick={fetchLeads}
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand text-white transition"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {[
          { id: "all", name: "Всі заявки" },
          { id: "TRADE_IN", name: "Trade-In" },
          { id: "BUYBACK", name: "Автовикуп" },
          { id: "BOOKING", name: "Бронювання" },
          { id: "CONTACT", name: "Зворотний зв'язок" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === tab.id
                ? "bg-brand text-background"
                : "bg-[#0E2A24] text-text-gray hover:text-white"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCcw className="w-10 h-10 text-brand animate-spin" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="glass p-16 rounded-[24px] border border-white/5 text-center text-text-gray">
          Немає заявок у цій категорії.
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {filteredLeads.map((lead) => {
            const details = JSON.parse(lead.details || "{}");
            const comments = JSON.parse(lead.comments || "[]");

            return (
              <div
                key={lead.id}
                className="glass p-6 sm:p-8 rounded-[24px] border border-white/5 space-y-6 hover:border-white/10 transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-extrabold text-lg">{lead.name}</span>
                    <span className="text-text-gray font-mono text-sm">{lead.phone}</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-[10px] text-text-gray font-semibold uppercase">Статус:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="premium-input py-1 px-3 text-xs bg-black/20 border-white/5 font-semibold appearance-none"
                    >
                      <option value="NEW">Нова</option>
                      <option value="IN_PROGRESS">В процесі</option>
                      <option value="COMPLETED">Виконано</option>
                      <option value="REJECTED">Відхилено</option>
                    </select>
                  </div>
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left specifications side */}
                  <div className="space-y-4">
                    <div className="flex gap-2 items-center text-xs text-brand font-extrabold uppercase">
                      <span>{typeLabels[lead.type] || lead.type}</span>
                    </div>

                    <div className="bg-[#071E1A]/40 border border-white/5 p-4 rounded-xl space-y-2 text-xs">
                      {lead.type === "TRADE_IN" && (
                        <>
                          <div className="flex justify-between"><span className="text-text-gray">Марка/Модель:</span> <span className="font-bold text-white">{details.make} {details.model}</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Рік:</span> <span className="font-bold text-white">{details.year}</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Пробіг:</span> <span className="font-bold text-white">{details.mileage} тис. км</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">VIN:</span> <span className="font-mono text-brand font-bold">{details.vin}</span></div>
                        </>
                      )}
                      {lead.type === "BUYBACK" && (
                        <>
                          <div className="flex justify-between"><span className="text-text-gray">Марка/Модель:</span> <span className="font-bold text-white">{details.make} {details.model}</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Рік:</span> <span className="font-bold text-white">{details.year}</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Пробіг:</span> <span className="font-bold text-white">{details.mileage} тис. км</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Очікувана ціна:</span> <span className="font-bold text-brand">{details.price} $</span></div>
                          <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-white/5">
                            <span className="text-text-gray">Стан авто:</span>
                            <span className="text-white italic">"{details.condition}"</span>
                          </div>
                        </>
                      )}
                      {lead.type === "BOOKING" && (
                        <>
                          <div className="flex justify-between"><span className="text-text-gray">ID Автомобіля:</span> <span className="font-bold text-white">{details.carId}</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Назва автомобіля:</span> <span className="font-bold text-white">{details.carName}</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Ціна автомобіля:</span> <span className="font-bold text-brand">{details.carPrice} $</span></div>
                        </>
                      )}
                      {lead.type === "LEASING" && (
                        <>
                          <div className="flex justify-between"><span className="text-text-gray">Ціна авто:</span> <span className="font-bold text-white">{details.price} $</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Перший внесок:</span> <span className="font-bold text-white">{details.downPaymentPercent}% ({details.downPaymentAmount} $)</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Термін:</span> <span className="font-bold text-white">{details.term} міс.</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Річна ставка:</span> <span className="font-bold text-white">{details.rate}%</span></div>
                          <div className="flex justify-between"><span className="text-text-gray">Щомісячний платіж:</span> <span className="font-bold text-brand">{details.monthlyPayment} $</span></div>
                        </>
                      )}
                    </div>
                    <span className="block text-[10px] text-text-gray/40">Створено: {new Date(lead.createdAt).toLocaleString("uk-UA")}</span>
                  </div>

                  {/* Right internal commentary list side */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase text-white font-bold tracking-wider">Коментарі менеджера</span>
                      <button
                        onClick={() => {
                          setActiveLead(lead);
                          setCommentModalOpen(true);
                        }}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        + Додати коментар
                      </button>
                    </div>

                    {comments.length === 0 ? (
                      <div className="text-xs text-text-gray italic">Немає внутрішніх коментарів.</div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {comments.map((c: any, cIdx: number) => (
                          <div key={cIdx} className="bg-black/10 p-2.5 rounded-lg border border-white/5 text-[11px] leading-relaxed">
                            <p className="text-white">{c.text}</p>
                            <span className="text-[9px] text-text-gray/50 block mt-1">
                              {new Date(c.createdAt).toLocaleString("uk-UA")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add comment dialog modal */}
      {commentModalOpen && activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass p-8 rounded-[24px] border border-white/5 max-w-md w-full relative space-y-6">
            <button onClick={() => setCommentModalOpen(false)} className="absolute top-4 right-4 text-text-gray hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h3 className="text-white font-extrabold text-lg uppercase tracking-wide">Додати коментар CRM</h3>
              <p className="text-xs text-text-gray mt-1">Заявка від {activeLead.name}</p>
            </div>

            <form onSubmit={handleAddCommentSubmit} className="space-y-4">
              <textarea
                required
                placeholder="Введіть замітку менеджера (наприклад: Клієнт просив передзвонити після 15:00)..."
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full premium-input resize-none text-sm"
              />
              
              <button
                type="submit"
                className="w-full py-3.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Зберегти коментар
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

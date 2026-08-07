"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PhoneCall, Calendar, RefreshCcw, Send, MessageSquare, Shield, Clock, HelpCircle, X, Trash2, Edit2, GripVertical, List, LayoutGrid, Search, Filter, SortDesc } from "lucide-react";

interface Lead {
  id: string;
  type: string;
  name: string;
  phone: string;
  details: string; // JSON
  status: string;
  comments: string; // JSON Array
  createdAt: string;
  source?: string;
  nextContactDate?: string;
  isPublic?: boolean;
  assignedUsers?: { id: string; name: string; avatar: string | null }[];
}

const COLUMNS = [
  { id: "NEW", title: "Нові", color: "border-brand/20 bg-brand/5", headerText: "text-brand" },
  { id: "IN_PROGRESS", title: "В процесі", color: "border-blue-500/20 bg-blue-500/5", headerText: "text-blue-400" },
  { id: "COMPLETED", title: "Виконано", color: "border-green-500/20 bg-green-500/5", headerText: "text-green-400" },
  { id: "REJECTED", title: "Відхилено", color: "border-red-500/20 bg-red-500/5", headerText: "text-red-400" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [commentText, setCommentText] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNextContactDate, setEditNextContactDate] = useState("");

  const { data: session } = useSession();
  const [tab, setTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "nextContact">("newest");

  const fetchLeads = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Optimistic UI update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeads(false);
    } catch (err) {
      console.error(err);
      fetchLeads(false); // Revert on error
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("leadId", leadId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.status !== status) {
        handleStatusChange(leadId, status);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цю заявку?")) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead) return;
    try {
      const res = await fetch(`/api/leads/${activeLead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editName, 
          phone: editPhone,
          nextContactDate: editNextContactDate || null,
        }),
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const typeLabels: Record<string, string> = {
    TRADE_IN: "Trade-In",
    BUYBACK: "Викуп",
    BOOKING: "Бронь",
    CONTACT: "Контакт",
  };

  const filteredLeads = leads
    .filter(lead => {
      if (tab === "my") {
        const isAssigned = lead.assignedUsers?.some(u => u.id === session?.user?.id);
        if (!isAssigned) return false;
      }
      if (statusFilter !== "ALL" && lead.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && lead.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const details = JSON.parse(lead.details || "{}");
        const matchName = lead.name.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        const matchCar = `${details.make || ""} ${details.model || ""} ${details.carName || ""}`.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCar) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "nextContact") {
        if (!a.nextContactDate && !b.nextContactDate) return 0;
        if (!a.nextContactDate) return 1;
        if (!b.nextContactDate) return -1;
        return new Date(a.nextContactDate).getTime() - new Date(b.nextContactDate).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">Керування запитами клієнтів</span>
          <h1 className="text-3xl font-extrabold text-white mt-1 uppercase">CRM (Kanban)</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLeads(true)}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand text-white transition flex items-center gap-2"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-bold">Оновити</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-max">
          <button 
            onClick={() => setTab("all")} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab === "all" ? "bg-brand text-black" : "text-white/70 hover:text-white"}`}
          >
            Всі заявки
          </button>
          <button 
            onClick={() => setTab("my")} 
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${tab === "my" ? "bg-brand text-black" : "text-white/70 hover:text-white"}`}
          >
            Мої заявки
          </button>
        </div>

        <div className="flex flex-wrap gap-3 bg-white/5 p-3 rounded-xl border border-white/10 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Пошук клієнта, телефону, авто..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand/50 transition"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand/50 transition">
              <option value="ALL">Всі статуси</option>
              {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand/50 transition">
              <option value="ALL">Всі типи</option>
              <option value="TRADE_IN">Trade-In</option>
              <option value="BUYBACK">Викуп</option>
              <option value="BOOKING">Бронь</option>
              <option value="CONTACT">Контакт</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortDesc className="w-4 h-4 text-white/40" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand/50 transition">
              <option value="newest">Найновіші спочатку</option>
              <option value="oldest">Найстаріші спочатку</option>
              <option value="nextContact">За датою нагадування</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-transparent overflow-hidden overflow-x-auto relative min-h-[500px] pb-10">
        <table className="w-full text-left text-sm text-white whitespace-nowrap border-separate border-spacing-y-3">
          <thead className="bg-transparent text-text-gray font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 font-extrabold tracking-widest opacity-50">Статус</th>
              <th className="px-4 py-2 font-extrabold tracking-widest opacity-50">Тип</th>
              <th className="px-4 py-2 font-extrabold tracking-widest opacity-50">Клієнт / Телефон</th>
              <th className="px-4 py-2 font-extrabold tracking-widest opacity-50 w-full">Деталі</th>
              <th className="px-4 py-2 font-extrabold tracking-widest opacity-50">Дата / Нагадування</th>
              <th className="px-4 py-2 font-extrabold tracking-widest opacity-50 text-right">Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => {
              const details = JSON.parse(lead.details || "{}");
              const comments = JSON.parse(lead.comments || "[]");
              const col = COLUMNS.find(c => c.id === lead.status);
              
              return (
                <tr key={lead.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <td className="p-4 bg-white/5 border-y border-l border-white/10 rounded-l-2xl group-hover:bg-white/10 transition-colors backdrop-blur-md">
                    <div className="relative inline-block border border-white/10 rounded-xl overflow-hidden shadow-sm">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`appearance-none bg-black/60 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer outline-none transition-colors hover:bg-black/80 ${col?.headerText}`}
                      >
                        {COLUMNS.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#1a1a1a]">{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-4 bg-white/5 border-y border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md">
                    <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-lg bg-white/10 text-white uppercase tracking-widest shadow-sm border border-white/5">
                      {typeLabels[lead.type] || lead.type}
                    </span>
                  </td>
                  <td className="p-4 bg-white/5 border-y border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md">
                    <div className="font-extrabold text-base mb-1 tracking-wide">{lead.name}</div>
                    <div className="text-brand text-xs font-mono bg-brand/10 inline-block px-2 py-0.5 rounded font-bold">{lead.phone}</div>
                  </td>
                  <td className="p-4 bg-white/5 border-y border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md text-white/80 text-sm truncate max-w-xs xl:max-w-md font-medium">
                    {(lead.type === "TRADE_IN" || lead.type === "BUYBACK") && details.make ? (
                      <span>{details.make} {details.model} <span className="opacity-50">({details.year})</span></span>
                    ) : lead.type === "BOOKING" && details.carName ? (
                      <span>{details.carName}</span>
                    ) : (
                      <span className="italic opacity-30 text-xs">Немає деталей</span>
                    )}
                  </td>
                  <td className="p-4 bg-white/5 border-y border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-[10px] text-text-gray font-bold uppercase tracking-widest">
                        Створено: <span className="text-white/70">{new Date(lead.createdAt).toLocaleDateString("uk-UA")}</span>
                      </div>
                      {lead.nextContactDate && (
                        <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-extrabold bg-yellow-400/10 px-2.5 py-1 rounded-lg w-max border border-yellow-400/20 shadow-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lead.nextContactDate).toLocaleString("uk-UA", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 bg-white/5 border-y border-r border-white/10 rounded-r-2xl group-hover:bg-white/10 transition-colors backdrop-blur-md text-right">
                    <div className="flex items-center justify-end gap-4 opacity-70 group-hover:opacity-100 transition">
                      {lead.assignedUsers && lead.assignedUsers.length > 0 && (
                        <div className="flex -space-x-2 mr-2">
                          {lead.assignedUsers.map((u) => (
                            <div key={u.id} className="w-7 h-7 rounded-full bg-brand text-black flex items-center justify-center text-[10px] font-extrabold border-2 border-[#1a1a1a] z-10 overflow-hidden shadow-md" title={u.name}>
                              {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                      <a href={`/admin/leads/${lead.id}`} className="bg-white/10 hover:bg-brand hover:text-black border border-white/10 hover:border-brand text-white font-bold text-xs uppercase tracking-wider transition-all px-4 py-2 rounded-xl">
                        Відкрити
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comment Modal */}
      {commentModalOpen && activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass p-6 rounded-2xl border border-white/10 max-w-md w-full relative space-y-4">
            <button onClick={() => setCommentModalOpen(false)} className="absolute top-4 right-4 text-text-gray hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h3 className="text-white font-extrabold text-lg">Коментарі</h3>
              <p className="text-xs text-brand">{activeLead.name}</p>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {JSON.parse(activeLead.comments || "[]").length === 0 ? (
                <div className="text-xs text-text-gray italic">Немає коментарів...</div>
              ) : (
                JSON.parse(activeLead.comments || "[]").map((c: any, i: number) => (
                  <div key={i} className="bg-white/5 p-2 rounded text-xs">
                    <p className="text-white">{c.text}</p>
                    <span className="text-[9px] text-text-gray mt-1 block">{new Date(c.createdAt).toLocaleString("uk-UA")}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Ваш коментар..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-sm text-white"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
              <button type="submit" className="bg-brand text-black p-2 rounded-lg hover:bg-brand/80">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass p-6 rounded-2xl border border-white/10 max-w-md w-full relative space-y-4">
            <button onClick={() => setEditModalOpen(false)} className="absolute top-4 right-4 text-text-gray hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h3 className="text-white font-extrabold text-lg">Редагувати заявку</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-gray uppercase font-bold">Ім'я</label>
                <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-text-gray uppercase font-bold">Телефон</label>
                <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-text-gray uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3"/> Нагадати / Перетелефонувати
                </label>
                <input type="datetime-local" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mt-1" value={editNextContactDate} onChange={(e) => setEditNextContactDate(e.target.value)} />
              </div>
              
              <button type="submit" className="w-full py-3 bg-brand text-black font-bold text-sm uppercase rounded-lg hover:bg-brand/80">
                Зберегти
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

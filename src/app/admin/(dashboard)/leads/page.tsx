"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, Calendar, RefreshCcw, Send, MessageSquare, Shield, Clock, HelpCircle, X, Trash2, Edit2, GripVertical, List, LayoutGrid } from "lucide-react";

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

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
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
    // Optimistic UI update
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error(err);
      fetchLeads(); // Revert on error
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">Керування запитами клієнтів</span>
          <h1 className="text-3xl font-extrabold text-white mt-1 uppercase">CRM (Kanban)</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLeads}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand text-white transition flex items-center gap-2"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-bold">Оновити</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto relative min-h-[500px]">
        <table className="w-full text-left text-sm text-white whitespace-nowrap">
          <thead className="bg-white/5 text-text-gray font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="p-4">Статус</th>
              <th className="p-4">Тип</th>
              <th className="p-4">Клієнт / Телефон</th>
              <th className="p-4 w-full">Деталі</th>
              <th className="p-4">Дата / Нагадування</th>
              <th className="p-4 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map(lead => {
              const details = JSON.parse(lead.details || "{}");
              const comments = JSON.parse(lead.comments || "[]");
              const col = COLUMNS.find(c => c.id === lead.status);
              
              return (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-wider bg-black/50 border border-white/10 rounded px-2 py-1 cursor-pointer appearance-none ${col?.headerText}`}
                    >
                      {COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white uppercase tracking-wider">
                      {typeLabels[lead.type] || lead.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{lead.name}</div>
                    <div className="text-brand text-xs font-mono mt-0.5">{lead.phone}</div>
                  </td>
                  <td className="p-4 text-text-gray text-xs truncate max-w-xs xl:max-w-md">
                    {(lead.type === "TRADE_IN" || lead.type === "BUYBACK") && details.make ? (
                      <span>{details.make} {details.model} ({details.year})</span>
                    ) : lead.type === "BOOKING" && details.carName ? (
                      <span>{details.carName}</span>
                    ) : (
                      <span className="italic opacity-50">Немає деталей</span>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    <div className="text-text-gray/50 mb-1">{new Date(lead.createdAt).toLocaleDateString("uk-UA")}</div>
                    {lead.nextContactDate && (
                      <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 font-semibold bg-yellow-400/10 px-1.5 py-0.5 rounded inline-flex">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.nextContactDate).toLocaleString("uk-UA")}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-50 group-hover:opacity-100 transition">
                      {lead.assignedUsers && lead.assignedUsers.length > 0 && (
                        <div className="flex -space-x-2 mr-2">
                          {lead.assignedUsers.map((u) => (
                            <div key={u.id} className="w-6 h-6 rounded-full bg-brand text-black flex items-center justify-center text-[10px] font-bold border border-black z-10 overflow-hidden" title={u.name}>
                              {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                      <a href={`/admin/leads/${lead.id}`} className="text-brand hover:underline font-bold text-xs uppercase transition">
                        Відкрити заявку
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

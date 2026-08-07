"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, Calendar, RefreshCcw, Send, MessageSquare, Shield, Clock, HelpCircle, X, Trash2, Edit2, GripVertical } from "lucide-react";

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
        <button
          onClick={fetchLeads}
          className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand text-white transition flex items-center gap-2"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-bold">Оновити</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter((l) => l.status === col.id);
          
          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-2xl border ${col.color} p-4 min-h-[500px] h-full`}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragOver={handleDragOver}
            >
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <h3 className={`font-extrabold uppercase tracking-wider text-sm ${col.headerText}`}>
                  {col.title}
                </h3>
                <span className="bg-black/30 text-white text-xs px-2 py-1 rounded-md font-mono">
                  {columnLeads.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {columnLeads.map((lead) => {
                  const details = JSON.parse(lead.details || "{}");
                  const comments = JSON.parse(lead.comments || "[]");
                  
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-brand/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center">
                          <GripVertical className="w-4 h-4 text-white/20" />
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white uppercase tracking-wider">
                            {typeLabels[lead.type] || lead.type}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => {
                            setActiveLead(lead);
                            setEditName(lead.name);
                            setEditPhone(lead.phone);
                            setEditNextContactDate(lead.nextContactDate ? new Date(lead.nextContactDate).toISOString().slice(0, 16) : "");
                            setEditModalOpen(true);
                          }} className="p-1 hover:bg-white/10 rounded text-text-gray hover:text-white">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteLead(lead.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
                        <p className="text-brand font-mono text-xs">{lead.phone}</p>
                      </div>

                      {(lead.type === "TRADE_IN" || lead.type === "BUYBACK") && details.make && (
                        <div className="mt-2 text-xs bg-white/5 p-1.5 rounded text-text-gray">
                          {details.make} {details.model} ({details.year})
                        </div>
                      )}
                      
                      {lead.type === "BOOKING" && details.carName && (
                        <div className="mt-2 text-xs bg-white/5 p-1.5 rounded text-text-gray">
                          {details.carName}
                        </div>
                      )}

                      {lead.nextContactDate && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-yellow-400 font-semibold bg-yellow-400/10 p-1.5 rounded">
                          <Calendar className="w-3 h-3" />
                          Перетелефонувати: {new Date(lead.nextContactDate).toLocaleString("uk-UA")}
                        </div>
                      )}

                      <div className="mt-3 flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-[9px] text-text-gray/50">
                          {new Date(lead.createdAt).toLocaleDateString("uk-UA")}
                        </span>
                        
                        <button 
                          onClick={() => {
                            setActiveLead(lead);
                            setCommentModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] text-brand hover:underline font-bold"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {comments.length}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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

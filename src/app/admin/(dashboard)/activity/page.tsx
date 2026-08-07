"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { RefreshCw, Activity, Car, PhoneCall, DollarSign, Settings, Trash, Edit, Plus, Info } from "lucide-react";

interface LogEntry {
  id: string;
  userId: string;
  action: string;
  entityId: string | null;
  entityType: string;
  details: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
  };
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [team, setTeam] = useState<{id: string, name: string}[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/activity?page=${page}&limit=20`;
      if (selectedUserId) url += `&userId=${selectedUserId}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pages || 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setTeam(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, selectedUserId]);

  const getActionConfig = (action: string, entityType: string) => {
    switch(action) {
      case "CREATE_CAR": return { icon: Plus, color: "text-green-400", bg: "bg-green-400/10", title: "Додано авто" };
      case "UPDATE_CAR": return { icon: Edit, color: "text-blue-400", bg: "bg-blue-400/10", title: "Відредаговано авто" };
      case "SELL_CAR": return { icon: DollarSign, color: "text-brand", bg: "bg-brand/10", title: "Продано авто" };
      case "DELETE_CAR": return { icon: Trash, color: "text-red-400", bg: "bg-red-400/10", title: "Видалено авто" };
      
      case "UPDATE_LEAD_STATUS": return { icon: RefreshCw, color: "text-purple-400", bg: "bg-purple-400/10", title: "Змінено статус заявки" };
      case "ADD_LEAD_COMMENT": return { icon: PhoneCall, color: "text-blue-400", bg: "bg-blue-400/10", title: "Коментар до заявки" };
      case "DELETE_LEAD": return { icon: Trash, color: "text-red-400", bg: "bg-red-400/10", title: "Видалено заявку" };
      
      default: return { icon: Activity, color: "text-gray-400", bg: "bg-gray-400/10", title: "Дія в системі" };
    }
  };

  const formatDetails = (action: string, detailsStr: string) => {
    try {
      const details = JSON.parse(detailsStr);
      switch(action) {
        case "CREATE_CAR": 
        case "DELETE_CAR":
          return <span className="font-bold text-white">{details.carName}</span>;
        case "UPDATE_CAR":
          return <span><span className="font-bold text-white">{details.carName}</span> {details.oldPrice && details.newPrice && `(Ціна: ${details.oldPrice} -> ${details.newPrice})`}</span>;
        case "SELL_CAR":
          return <span className="font-bold text-brand">{details.carName} 🎉</span>;
        case "UPDATE_LEAD_STATUS":
          return <span><span className="font-bold text-white">{details.leadName}</span>: {details.oldStatus} ➔ {details.newStatus}</span>;
        case "ADD_LEAD_COMMENT":
          return <span><span className="font-bold text-white">{details.leadName}</span>: &quot;{details.comment}&quot;</span>;
        default:
          return <span className="text-text-gray text-xs">{JSON.stringify(details)}</span>;
      }
    } catch {
      return <span>{detailsStr}</span>;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide uppercase">Історія дій</h1>
          <p className="text-text-gray mt-2">Моніторинг активності співробітників у CRM</p>
        </div>

        <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex gap-2">
          <select 
            value={selectedUserId}
            onChange={(e) => { setSelectedUserId(e.target.value); setPage(1); }}
            className="premium-input bg-transparent border-none py-2 text-sm w-48"
          >
            <option value="">Всі співробітники</option>
            {team.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
        {loading && page === 1 ? (
          <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-brand animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-text-gray">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Дій не знайдено</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const conf = getActionConfig(log.action, log.entityType);
              const Icon = conf.icon;
              return (
                <div key={log.id} className="p-4 hover:bg-white/5 transition flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  
                  {/* User info */}
                  <div className="flex items-center gap-3 w-48 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center font-bold text-xs overflow-hidden text-brand">
                      {log.user.avatar ? (
                        <img src={log.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        log.user.name?.[0] || "?"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{log.user.name}</div>
                      <div className="text-[10px] text-text-gray uppercase tracking-wider">{log.user.role}</div>
                    </div>
                  </div>

                  {/* Action Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${conf.bg} ${conf.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <div className="text-sm text-text-gray">
                      {conf.title} <span className="opacity-50">·</span> {formatDetails(log.action, log.details)}
                    </div>
                    <div className="text-[10px] text-text-gray/50 mt-1 uppercase tracking-wider">
                      {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: uk })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                page === i + 1 
                  ? "bg-brand text-background" 
                  : "bg-white/5 text-text-gray hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { RefreshCw, Terminal } from "lucide-react";

interface BotLog {
  id: string;
  payload: string;
  createdAt: string;
}

export default function BotLogsPage() {
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bot-logs?page=${page}&limit=20`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide uppercase flex items-center gap-3">
            <Terminal className="w-8 h-8 text-brand" /> Логи Телеграм Бота
          </h1>
          <p className="text-text-gray mt-2">Повна історія отриманих даних від бота</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Оновити
        </button>
      </div>

      {loading && logs.length === 0 ? (
        <div className="text-center py-20 text-brand animate-pulse">Завантаження логів...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 text-text-gray bg-white/5 rounded-3xl border border-dashed border-white/10">
          Логів поки немає
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-[#0A1A17] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-bold text-text-gray uppercase tracking-widest">
                  ID Логу: {log.id}
                </div>
                <div className="text-xs font-bold text-brand uppercase">
                  {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm:ss", { locale: uk })}
                </div>
              </div>
              <div className="bg-black/50 p-4 rounded-xl overflow-x-auto border border-white/5">
                <pre className="text-xs text-white/80 font-mono">
                  {log.payload}
                </pre>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/5 text-white rounded-lg disabled:opacity-50"
              >
                Попередня
              </button>
              <span className="px-4 py-2 text-text-gray font-bold">
                Сторінка {page} з {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/5 text-white rounded-lg disabled:opacity-50"
              >
                Наступна
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

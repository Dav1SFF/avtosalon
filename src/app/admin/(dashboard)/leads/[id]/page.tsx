"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, User as UserIcon, Phone, FileText, Calendar, Lock, Unlock, Send, CheckCircle, Clock, XCircle, UserPlus, UserMinus, ShieldAlert, MessageSquare } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatar: string | null;
}

interface Lead {
  id: string;
  type: string;
  name: string;
  phone: string;
  details: string;
  status: string;
  comments: string;
  createdAt: string;
  isPublic: boolean;
  assignedUsers: User[];
}

const typeLabels: Record<string, string> = {
  TRADE_IN: "🔄 Trade-In",
  BUYBACK: "💰 Викуп",
  BOOKING: "📅 Бронь",
  CONTACT: "✉️ Зворотний зв'язок",
};

export default function LeadDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showUserSelect, setShowUserSelect] = useState(false);

  const fetchLead = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("У вас немає доступу до цієї приватної заявки.");
        if (res.status === 404) throw new Error("Заявку не знайдено.");
        throw new Error("Не вдалося завантажити заявку.");
      }
      const data = await res.json();
      setLead(data.lead);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch team", e);
    }
  };

  useEffect(() => {
    fetchLead();
    fetchTeam();
  }, [id]);

  const updateLead = async (data: any, optimisticUpdater?: (prev: Lead) => Lead) => {
    if (optimisticUpdater && lead) {
      setLead(optimisticUpdater(lead));
    }
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Помилка оновлення");
      fetchLead(false);
    } catch (error) {
      console.error(error);
      alert("Сталася помилка при оновленні.");
      fetchLead(false); // revert on error
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !session?.user) return;
    
    const newComment = {
      text: commentText,
      author: session.user.name || "Менеджер",
      authorAvatar: session.user.image || (session.user as any).avatar,
      createdAt: new Date().toISOString()
    };

    updateLead({ comment: commentText }, (prev) => {
      const existingComments = JSON.parse(prev.comments || "[]");
      return { ...prev, comments: JSON.stringify([...existingComments, newComment]) };
    });
    setCommentText("");
  };

  const handleAssignToMe = () => {
    if (!session?.user?.id) return;
    const newStatus = lead?.status === "NEW" ? "IN_PROGRESS" : undefined;
    const currentUserId = session.user.id as string;
    const currentUserName = session.user.name as string;
    const currentUserImage = session.user.image as string | null;
    
    updateLead(
      { assignUserId: currentUserId, status: newStatus },
      (prev) => ({ 
        ...prev, 
        status: newStatus || prev.status, 
        assignedUsers: [...prev.assignedUsers, { id: currentUserId, name: currentUserName, avatar: currentUserImage }] 
      })
    );
  };

  const handleAssignUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    const newStatus = lead?.status === "NEW" ? "IN_PROGRESS" : undefined;
    updateLead(
      { assignUserId: userId, status: newStatus },
      (prev) => ({ 
        ...prev, 
        status: newStatus || prev.status, 
        assignedUsers: [...prev.assignedUsers, user] 
      })
    );
    setShowUserSelect(false);
  };

  const handleUnassignMe = () => {
    if (!session?.user?.id) return;
    updateLead(
      { unassignUserId: session.user.id },
      (prev) => ({ ...prev, assignedUsers: prev.assignedUsers.filter(u => u.id !== session.user?.id) })
    );
  };

  const togglePublic = () => {
    if (!lead) return;
    updateLead(
      { isPublic: !lead.isPublic },
      (prev) => ({ ...prev, isPublic: !prev.isPublic })
    );
  };

  if (loading) return <div className="h-full flex items-center justify-center text-white font-bold">Завантаження...</div>;
  
  if (error) return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
      <ShieldAlert className="w-16 h-16 text-red-500" />
      <h2 className="text-2xl font-extrabold text-white">{error}</h2>
      <button onClick={() => router.push("/admin/leads")} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition">Повернутися до списку</button>
    </div>
  );

  if (!lead) return null;

  const details = JSON.parse(lead.details || "{}");
  const comments = JSON.parse(lead.comments || "[]");
  const isAssignedToMe = lead.assignedUsers.some(u => u.id === session?.user?.id);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="space-y-6 h-full flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <button onClick={() => router.push("/admin/leads")} className="p-3 hover:bg-white/5 rounded-xl text-text-gray hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">Деталі заявки #{lead.id.slice(0, 8)}</span>
          <h1 className="text-3xl font-extrabold text-white mt-1 uppercase flex items-center gap-3">
            {lead.name}
            <span className="text-sm px-3 py-1 bg-white/10 rounded-full font-bold">{typeLabels[lead.type] || lead.type}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-[calc(100vh-200px)] overflow-hidden">
        
        {/* Left Column: Client Info */}
        <div className="lg:col-span-3 bg-black/20 border border-white/10 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4 border-b border-white/10 pb-2">Дані Клієнта</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-gray">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-text-gray uppercase font-bold">Ім'я</div>
                <div className="text-white font-bold">{lead.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-brand uppercase font-bold">Телефон</div>
                <div className="text-white font-mono font-bold">{lead.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-gray">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-text-gray uppercase font-bold">Створено</div>
                <div className="text-white text-sm">{new Date(lead.createdAt).toLocaleString("uk-UA")}</div>
              </div>
            </div>
          </div>

          <h2 className="text-white font-bold uppercase tracking-wider text-sm mt-8 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Опис
          </h2>
          <div className="bg-white/5 rounded-xl p-4 text-sm text-text-gray">
            {(lead.type === "TRADE_IN" || lead.type === "BUYBACK") && details.make ? (
              <ul className="space-y-2">
                <li><b className="text-white">Авто:</b> {details.make} {details.model} ({details.year})</li>
                {details.vin && <li><b className="text-white">VIN:</b> <span className="font-mono">{details.vin}</span></li>}
                {details.price && <li><b className="text-white">Очікувана ціна:</b> {details.price} $</li>}
                {details.mileage && <li><b className="text-white">Пробіг:</b> {details.mileage} тис. км</li>}
                {details.condition && <li><b className="text-white">Стан:</b> {details.condition}</li>}
              </ul>
            ) : lead.type === "BOOKING" && details.carName ? (
              <ul className="space-y-2">
                <li><b className="text-white">Авто:</b> {details.carName}</li>
                <li><b className="text-white">Ціна авто:</b> {details.carPrice} $</li>
              </ul>
            ) : details.message ? (
              <p className="text-white">{details.message}</p>
            ) : (
              <span className="italic opacity-50">Додаткових деталей немає</span>
            )}
          </div>
        </div>

        {/* Center Column: Comments */}
        <div className="lg:col-span-6 flex flex-col bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Коментарі та історія
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-gray/50 italic">
                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                Поки що немає коментарів
              </div>
            ) : (
              comments.map((c: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand flex-shrink-0 flex items-center justify-center text-black font-bold text-xs uppercase overflow-hidden">
                    {c.authorAvatar ? <img src={c.authorAvatar} alt={c.author} className="w-full h-full object-cover" /> : c.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{c.author}</span>
                      <span className="text-[10px] text-text-gray">{new Date(c.createdAt).toLocaleString("uk-UA")}</span>
                    </div>
                    <div className="bg-white/5 rounded-b-xl rounded-tr-xl p-3 text-sm text-text-gray">
                      {c.text}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-black/60 border-t border-white/10">
            {isAdmin || isAssignedToMe ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введіть коментар..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand transition"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
                <button type="submit" className="bg-brand text-black p-3 rounded-xl hover:bg-brand/80 transition flex items-center justify-center font-bold gap-2">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Надіслати</span>
                </button>
              </form>
            ) : (
              <div className="text-center text-xs text-text-gray/50 italic py-2">
                Тільки адміністратори та відповідальні менеджери можуть залишати коментарі.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assignees & Settings */}
        <div className="lg:col-span-3 bg-black/20 border border-white/10 rounded-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col">
          <h2 className="text-white font-bold uppercase tracking-wider text-sm mb-4 border-b border-white/10 pb-2">Управління</h2>
          
          <div className="space-y-6">
            
            {/* Status Change */}
            <div>
              <div className="text-xs text-text-gray uppercase font-bold mb-2">Статус заявки</div>
              <select
                value={lead.status}
                onChange={(e) => updateLead({ status: e.target.value }, (prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isAdmin && !isAssignedToMe}
              >
                <option value="NEW">🆕 Нова</option>
                <option value="IN_PROGRESS">⏳ В процесі</option>
                <option value="COMPLETED">✅ Виконано</option>
                <option value="REJECTED">❌ Відхилено</option>
              </select>
            </div>

            {/* Privacy Toggle */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-white uppercase font-bold flex items-center gap-2">
                  {lead.isPublic ? <Unlock className="w-4 h-4 text-brand" /> : <Lock className="w-4 h-4 text-red-500" />}
                  {lead.isPublic ? "Публічно" : "Не Публічно"}
                </div>
                {(isAdmin || isAssignedToMe) && (
                  <button onClick={togglePublic} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded">Змінити</button>
                )}
              </div>
              <p className="text-[10px] text-text-gray leading-tight">
                {lead.isPublic 
                  ? "Всі менеджери можуть переглядати цю заявку та приєднуватись." 
                  : "Тільки адміністратори та призначені менеджери можуть переглядати цю заявку."}
              </p>
            </div>

            {/* Assignees */}
            <div>
              <div className="text-xs text-text-gray uppercase font-bold mb-2 flex justify-between items-center relative">
                Відповідальні
                <div className="flex gap-2">
                  {!isAssignedToMe && (
                    <button onClick={handleAssignToMe} className="text-brand hover:underline flex items-center gap-1">
                      <UserPlus className="w-3 h-3" /> Взяти в роботу
                    </button>
                  )}
                  {isAdmin && (
                    <div className="relative">
                      <button onClick={() => setShowUserSelect(!showUserSelect)} className="text-text-gray hover:text-white flex items-center gap-1 ml-2">
                        + Додати
                      </button>
                      {showUserSelect && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                          {allUsers.filter(u => !lead.assignedUsers.find(a => a.id === u.id)).map(user => (
                            <button
                              key={user.id}
                              onClick={() => handleAssignUser(user.id)}
                              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-brand text-black flex items-center justify-center text-[10px] uppercase font-bold overflow-hidden">
                                {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0]}
                              </div>
                              {user.name}
                            </button>
                          ))}
                          {allUsers.filter(u => !lead.assignedUsers.find(a => a.id === u.id)).length === 0 && (
                            <div className="px-3 py-2 text-xs text-text-gray italic">Немає доступних менеджерів</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {lead.assignedUsers.length === 0 ? (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-4 text-center text-xs text-text-gray/50">
                  Немає відповідального менеджера
                </div>
              ) : (
                <div className="space-y-2">
                  {lead.assignedUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand text-black flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                          {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name[0]}
                        </div>
                        <span className="text-sm font-bold text-white">{user.name}</span>
                      </div>
                      {(user.id === session?.user?.id || isAdmin) && (
                        <button 
                          onClick={() => updateLead({ unassignUserId: user.id }, (prev) => ({ ...prev, assignedUsers: prev.assignedUsers.filter(u => u.id !== user.id) }))} 
                          className="text-red-500/50 hover:text-red-500 transition" 
                          title="Зняти відповідального"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

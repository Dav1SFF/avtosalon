"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Users, Edit3, DollarSign, Briefcase, Plus, X, Upload } from "lucide-react";
import Image from "next/image";

interface UserStat {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  commissionRate: number;
  salesCount: number;
  uploadedCarsCount: number;
  totalBonus: number;
  avatar?: string;
  telegramId?: string;
}

export default function TeamPage() {
  const [team, setTeam] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editSalary, setEditSalary] = useState("");
  const [editCommission, setEditCommission] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editTelegramId, setEditTelegramId] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Creating state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("MANAGER");
  const [newSalary, setNewSalary] = useState("");
  const [newCommission, setNewCommission] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newTelegramId, setNewTelegramId] = useState("");

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/team?month=${month}&year=${year}`);
      const data = await res.json();
      if (Array.isArray(data)) setTeam(data);
    } catch (error) {
      console.error("Failed to fetch team", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [month, year]);

  const handleSaveUser = async (id: string) => {
    try {
      const res = await fetch("/api/admin/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          salary: editSalary,
          commissionRate: editCommission,
          role: editRole,
          avatar: editAvatar,
          telegramId: editTelegramId || null
        })
      });
      if (res.ok) {
        setEditingUserId(null);
        fetchTeam();
      } else {
        alert("Помилка збереження");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          salary: newSalary,
          commissionRate: newCommission,
          avatar: newAvatar,
          telegramId: newTelegramId || null
        })
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewSalary("");
        setNewCommission("");
        setNewAvatar("");
        setNewTelegramId("");
        fetchTeam();
      } else {
        const err = await res.json();
        alert(err.error || "Помилка створення");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    if (!e.target.files?.length) return;
    setUploadingAvatar(true);
    try {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (isEdit) {
          setEditAvatar(data.url);
        } else {
          setNewAvatar(data.url);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openEdit = (user: UserStat) => {
    setEditingUserId(user.id);
    setEditSalary(user.salary.toString());
    setEditCommission(user.commissionRate.toString());
    setEditRole(user.role);
    setEditAvatar(user.avatar || "");
    setEditTelegramId(user.telegramId || "");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide uppercase">Команда та KPI</h1>
          <p className="text-text-gray mt-2">Управління менеджерами, ставки та розрахунок бонусів</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-background font-bold uppercase tracking-wider rounded-xl transition"
        >
          <Plus className="w-5 h-5" /> Додати Менеджера
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
      </div>

      {loading ? (
        <div className="text-center py-20 text-brand animate-pulse">Завантаження...</div>
      ) : team.length === 0 ? (
        <div className="text-center py-20 text-text-gray bg-white/5 rounded-3xl border border-dashed border-white/10">
          Співробітників не знайдено
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {team.map((user) => (
            <div key={user.id} className="bg-[#0A1A17] p-6 rounded-3xl border border-white/5 hover:border-brand/30 transition group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10 transition group-hover:bg-brand/10" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand/20 relative">
                      <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xl border-2 border-brand/20">
                      {user.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white leading-tight">{user.name}</h3>
                    <p className="text-xs text-text-gray">{user.email}</p>
                  </div>
                </div>
                {editingUserId === user.id ? (
                  <button onClick={() => setEditingUserId(null)} className="text-xs font-bold text-text-gray uppercase hover:text-white">Скасувати</button>
                ) : (
                  <button onClick={() => openEdit(user)} className="p-2 bg-white/5 text-text-gray rounded-lg hover:text-brand transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {editingUserId === user.id ? (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-text-gray font-bold">Роль</label>
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="premium-input text-xs">
                      <option value="MANAGER">Менеджер</option>
                      <option value="ADMIN">Адміністратор</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-text-gray font-bold">Ставка ($)</label>
                    <input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} className="premium-input text-xs" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-text-gray font-bold">% від прибутку з продажу</label>
                    <input type="number" value={editCommission} onChange={(e) => setEditCommission(e.target.value)} className="premium-input text-xs" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-text-gray font-bold">Telegram ID</label>
                    <input type="text" value={editTelegramId} onChange={(e) => setEditTelegramId(e.target.value)} className="premium-input text-xs" placeholder="Наприклад, 123456789" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase text-text-gray font-bold">Аватар (URL або Завантажити)</label>
                    <div className="flex gap-2">
                      <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} className="premium-input text-xs flex-grow" placeholder="https://..." />
                      <label className="bg-brand/10 text-brand px-3 py-2 rounded-lg cursor-pointer hover:bg-brand hover:text-background transition flex items-center justify-center">
                        {uploadingAvatar ? <span className="animate-spin text-xs">...</span> : <Upload className="w-4 h-4" />}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadAvatar(e, true)} />
                      </label>
                    </div>
                  </div>
                  <button onClick={() => handleSaveUser(user.id)} className="w-full py-2 bg-brand text-background font-bold uppercase tracking-wider rounded-lg text-xs">
                    Зберегти
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-gray font-bold mb-1">Ставка</div>
                      <div className="text-white font-bold text-lg">${user.salary}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-text-gray font-bold mb-1">Комісія</div>
                      <div className="text-white font-bold text-lg">{user.commissionRate}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-brand font-bold mb-3 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Результати ({format(new Date(2000, month-1, 1), 'LLLL', {locale: uk})})
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-text-gray">Продано авто</div>
                        <div className="text-white font-black text-2xl">{user.salesCount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-text-gray">Залито на сайт</div>
                        <div className="text-white font-black text-2xl text-center">{user.uploadedCarsCount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-gray">Бонус з продажів</div>
                        <div className="text-brand font-black text-3xl">+${user.totalBonus}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center bg-brand/5 px-4 py-3 rounded-xl">
                    <div className="text-xs font-bold text-text-gray uppercase">До виплати:</div>
                    <div className="text-xl font-black text-white">${user.salary + user.totalBonus}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0E2A24] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black text-white uppercase tracking-wide mb-6">Новий Менеджер</h3>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Ім'я</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input w-full" placeholder="Іван Іванов" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Email</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="premium-input w-full" placeholder="ivan@example.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Пароль</label>
                <input type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="premium-input w-full" placeholder="******" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Роль</label>
                  <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="premium-input w-full">
                    <option value="MANAGER">Менеджер</option>
                    <option value="ADMIN">Адміністратор</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Ставка ($)</label>
                  <input type="number" required value={newSalary} onChange={(e) => setNewSalary(e.target.value)} className="premium-input w-full text-white font-bold" placeholder="500" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">% від прибутку (бонус)</label>
                <input type="number" required value={newCommission} onChange={(e) => setNewCommission(e.target.value)} className="premium-input w-full text-white font-bold" placeholder="10" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Telegram ID</label>
                <input type="text" value={newTelegramId} onChange={(e) => setNewTelegramId(e.target.value)} className="premium-input w-full" placeholder="Наприклад, 123456789" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-gray font-semibold uppercase tracking-wider">Аватар</label>
                <div className="flex gap-2">
                  <input type="text" value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} className="premium-input w-full text-xs" placeholder="URL зображення" />
                  <label className="bg-brand/10 text-brand px-4 py-2 rounded-lg cursor-pointer hover:bg-brand hover:text-background transition flex items-center justify-center">
                    {uploadingAvatar ? <span className="animate-spin text-xs">...</span> : <Upload className="w-5 h-5" />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadAvatar(e, false)} />
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase rounded-xl transition">
                  Скасувати
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand hover:bg-brand-hover text-background font-bold uppercase rounded-xl transition">
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

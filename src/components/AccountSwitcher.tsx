"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { ChevronDown, RefreshCw, LogOut, ArrowLeftRight } from "lucide-react";

export default function AccountSwitcher({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAdmin = session?.user?.role === "ADMIN";
  const originalAdminId = session?.user?.originalAdminId;
  const canSwitch = isAdmin || originalAdminId;

  useEffect(() => {
    if (isOpen && team.length === 0 && canSwitch) {
      fetch("/api/admin/team")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTeam(data);
          else if (data.team && Array.isArray(data.team)) setTeam(data.team);
        })
        .catch(console.error);
    }
  }, [isOpen, team.length, canSwitch]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchAccount = async (userId: string) => {
    setSwitchingTo(userId);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (data.token) {
        await signIn("credentials", {
          switchToken: data.token,
          redirect: true,
          callbackUrl: "/admin"
        });
      } else {
        alert("Помилка при зміні акаунта");
        setSwitchingTo(null);
      }
    } catch (error) {
      console.error(error);
      setSwitchingTo(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => canSwitch && setIsOpen(!isOpen)}
        className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 transition ${canSwitch ? "cursor-pointer hover:bg-white/5 bg-black/20" : "bg-black/20"}`}
      >
        <div className="w-9 h-9 shrink-0 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold overflow-hidden">
          {session.user?.avatar ? (
            <img src={session.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            session.user?.name?.[0] || "A"
          )}
        </div>
        <div className="min-w-0 flex-grow">
          <span className="block text-xs font-bold text-white truncate">{session.user?.name}</span>
          <span className="block text-[10px] text-text-gray/50 font-semibold truncate uppercase">
            {session.user?.role || "Менеджер"} {originalAdminId && "(Імперсонація)"}
          </span>
        </div>
        {canSwitch && (
          <ChevronDown className={`w-4 h-4 text-text-gray transition-transform ${isOpen ? "rotate-180" : ""}`} />
        )}
      </div>

      {isOpen && canSwitch && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#0E2A24] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-scaleIn origin-top">
          
          <div className="p-3 bg-black/20 border-b border-white/5">
            <span className="text-[10px] uppercase tracking-wider font-bold text-text-gray">Змінити акаунт</span>
          </div>

          <div className="max-h-60 overflow-y-auto p-2 space-y-1">
            {team.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-gray flex justify-center"><RefreshCw className="w-4 h-4 animate-spin" /></div>
            ) : (
              team.map((member) => (
                <button
                  key={member.id}
                  disabled={switchingTo !== null || member.id === session.user?.id}
                  onClick={() => handleSwitchAccount(member.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition ${
                    member.id === session.user?.id 
                      ? "bg-brand/10 opacity-50 cursor-default" 
                      : "hover:bg-white/10"
                  }`}
                >
                  <div className="w-7 h-7 shrink-0 rounded-md bg-white/5 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {member.avatar ? (
                      <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      member.name?.[0] || "U"
                    )}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="block text-xs font-bold text-white truncate">{member.name}</span>
                    <span className="block text-[9px] text-text-gray/50 font-semibold truncate uppercase">
                      {member.role}
                    </span>
                  </div>
                  {switchingTo === member.id && <RefreshCw className="w-3 h-3 text-brand animate-spin" />}
                </button>
              ))
            )}
          </div>

          {originalAdminId && (
            <div className="p-2 border-t border-white/5 bg-brand/5">
              <button
                onClick={() => handleSwitchAccount(originalAdminId)}
                disabled={switchingTo !== null}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-brand hover:bg-brand/10 transition text-xs font-bold uppercase tracking-wider"
              >
                {switchingTo === originalAdminId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
                Повернутись в Адмін
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

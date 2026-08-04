"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Невірний email або пароль");
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("Щось пішло не так. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#071E1A] px-4 selection:bg-brand selection:text-background font-sans">
      <div className="w-full max-w-md space-y-6">
        
        {/* Branding logo */}
        <div className="text-center">
          <span className="text-3xl font-extrabold tracking-wider text-brand block leading-none">
            VIDKRYTYI
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-text-gray block mt-1.5 font-semibold">
            Панель управління
          </span>
        </div>

        {/* Login form card */}
        <div className="glass p-8 rounded-[24px] border border-white/5 shadow-2xl space-y-6">
          <h2 className="text-white text-lg font-bold uppercase tracking-wide text-center">Вхід для співробітників</h2>
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Електронна пошта</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@vidkrytyi.com.ua"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full premium-input pl-11"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-gray/50" />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Пароль</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full premium-input pl-11"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-gray/50" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand hover:bg-brand-hover text-background text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Вхід...</span>
                  </>
                ) : (
                  <span>Увійти в кабінет</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

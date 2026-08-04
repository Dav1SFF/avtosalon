"use client";

import React, { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { CheckCircle, DollarSign, Calculator, Send, Percent, Calendar } from "lucide-react";

export default function LeasingPage() {
  const [price, setPrice] = useState(30000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [term, setTerm] = useState(36); // months
  const [rate, setRate] = useState(10); // annual rate %

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic calculations
  const downPaymentAmount = (price * downPaymentPercent) / 100;
  const loanPrincipal = price - downPaymentAmount;
  
  // Monthly interest rate calculation
  const monthlyRate = (rate / 12) / 100;
  
  // Monthly Payment Formula (Amortization): P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const monthlyPayment = monthlyRate > 0
    ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, term))) / (Math.pow(1 + monthlyRate, term) - 1)
    : loanPrincipal / term;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LEASING",
          name,
          phone,
          details: {
            price,
            downPaymentPercent,
            downPaymentAmount,
            term,
            rate,
            monthlyPayment: Math.round(monthlyPayment),
          },
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setPhone("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand uppercase tracking-widest block mb-2">Фінансові послуги</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase leading-tight font-sans">
              Калькулятор <span className="text-brand">Лізингу</span>
            </h1>
            <p className="text-sm text-text-gray mt-4 max-w-lg mx-auto">
              Розрахуйте комфортний щомісячний платіж самостійно за допомогою наших гнучких умов фінансування.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side: Controls */}
            <div className="lg:col-span-7 glass p-8 rounded-[24px] border border-white/5 space-y-8">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand" />
                Параметри лізингу
              </h3>

              {/* Price slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-text-gray">Вартість автомобіля</span>
                  <span className="text-brand text-lg font-bold">{price.toLocaleString()} $</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={150000}
                  step={1000}
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  className="w-full accent-brand bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] text-text-gray/50 uppercase">
                  <span>5,000 $</span>
                  <span>150,000 $</span>
                </div>
              </div>

              {/* Downpayment slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-text-gray">Перший внесок</span>
                  <span className="text-brand text-lg font-bold">
                    {downPaymentPercent}% ({downPaymentAmount.toLocaleString()} $)
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                  className="w-full accent-brand bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] text-text-gray/50 uppercase">
                  <span>10%</span>
                  <span>70%</span>
                </div>
              </div>

              {/* Term slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-text-gray">Термін лізингу</span>
                  <span className="text-brand text-lg font-bold">{term} місяців</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={84}
                  step={12}
                  value={term}
                  onChange={(e) => setTerm(parseInt(e.target.value))}
                  className="w-full accent-brand bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] text-text-gray/50 uppercase">
                  <span>12 міс.</span>
                  <span>84 міс.</span>
                </div>
              </div>

              {/* Interest rate */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-text-gray">Річна відсоткова ставка</span>
                  <span className="text-brand text-lg font-bold">{rate}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={rate}
                  onChange={(e) => setRate(parseInt(e.target.value))}
                  className="w-full accent-brand bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
                <div className="flex justify-between text-[10px] text-text-gray/50 uppercase">
                  <span>5%</span>
                  <span>25%</span>
                </div>
              </div>
            </div>

            {/* Right side: Summary and Request Form */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Summary */}
              <div className="glass p-8 rounded-[24px] border border-white/5 bg-gradient-to-br from-[#0E2A24] to-[#071E1A] space-y-6 shadow-xl">
                <h3 className="text-white font-bold text-lg uppercase tracking-wide">Результати розрахунку</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 text-sm text-text-gray">
                    <span>Сума фінансування:</span>
                    <span className="text-white font-bold">{loanPrincipal.toLocaleString()} $</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm text-text-gray">
                    <span>Сума першого внеску:</span>
                    <span className="text-white font-bold">{downPaymentAmount.toLocaleString()} $</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between items-end py-2">
                    <span className="text-xs uppercase text-text-gray/60 font-semibold mb-1">Щомісячний платіж:</span>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-brand font-sans tracking-wide">
                        {Math.round(monthlyPayment).toLocaleString()} $
                      </span>
                      <span className="text-[10px] text-text-gray block">/ місяць</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Application */}
              <div className="glass p-8 rounded-[24px] border border-white/5 space-y-6">
                <h3 className="text-white font-bold text-base uppercase tracking-wide">Подати запит на лізинг</h3>
                
                {success ? (
                  <div className="p-6 bg-brand/10 border border-brand/20 rounded-xl text-center space-y-3 animate-fadeIn">
                    <CheckCircle className="w-8 h-8 text-brand mx-auto" />
                    <p className="text-white font-bold text-sm">Заявку успішно відправлено!</p>
                    <p className="text-xs text-text-gray">Наш кредитний експерт зв'яжеться з вами для уточнення деталей.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Ваше Ім'я</label>
                      <input
                        type="text"
                        required
                        placeholder="Введіть ім'я"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full premium-input"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Номер телефону</label>
                      <input
                        type="tel"
                        required
                        placeholder="+380"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full premium-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-brand hover:bg-brand-hover text-background font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
                    >
                      {submitting ? "Надсилання..." : "Подати заявку"}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}

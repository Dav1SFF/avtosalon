"use client";

import React, { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { RefreshCw, Send, CheckCircle, Car } from "lucide-react";

const tradeInSchema = zod.object({
  name: zod.string().min(2, "Введіть ваше ім'я"),
  phone: zod.string().min(10, "Введіть коректний номер телефону"),
  make: zod.string().min(2, "Введіть марку автомобіля"),
  model: zod.string().min(1, "Введіть модель автомобіля"),
  year: zod.coerce.number().min(1990).max(new Date().getFullYear()),
  mileage: zod.coerce.number().min(0, "Пробіг повинен бути позитивним"),
  vin: zod.string().min(17, "VIN-код повинен складатися з 17 символів").max(17, "VIN-код повинен складатися з 17 символів").toUpperCase(),
});

type TradeInFormValues = zod.infer<typeof tradeInSchema>;

export default function TradeInPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tradeInSchema),
  });

  const onSubmit = async (values: TradeInFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TRADE_IN",
          name: values.name,
          phone: values.phone,
          details: {
            make: values.make,
            model: values.model,
            year: values.year,
            mileage: values.mileage,
            vin: values.vin,
          },
        }),
      });

      if (res.ok) {
        setSuccess(true);
        reset();
      }
    } catch (error) {
      console.error("Trade-In Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest block mb-2">Обмін авто</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase leading-tight font-sans">
              Заявка на <span className="text-brand">Trade-In</span>
            </h1>
            <p className="text-sm text-text-gray mt-4 max-w-lg mx-auto">
              Оцініть свій автомобіль онлайн та обміняйте його на новий. Заповніть форму нижче, і наш менеджер зв'яжеться з вами протягом 15 хвилин.
            </p>
          </div>

          <div className="glass p-8 sm:p-10 rounded-[24px] border border-white/5 shadow-2xl">
            {success ? (
              <div className="text-center py-12 space-y-6 animate-fadeIn">
                <div className="w-16 h-16 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-brand" />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">Заявку прийнято!</h3>
                <p className="text-sm text-text-gray max-w-sm mx-auto leading-relaxed">
                  Дякуємо за звернення. Наш спеціаліст з оцінки зв'яжеться з вами найближчим часом для детального прорахунку.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-3 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand hover:text-background transition"
                >
                  Надіслати ще раз
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Section 1: Customer info */}
                <div className="border-b border-white/5 pb-6">
                  <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs flex items-center justify-center font-bold">1</span>
                    Контактні дані
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Ваше Ім'я</label>
                      <input
                        type="text"
                        placeholder="Введіть ім'я"
                        {...register("name")}
                        className="w-full premium-input"
                      />
                      {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Номер телефону</label>
                      <input
                        type="tel"
                        placeholder="+380"
                        {...register("phone")}
                        className="w-full premium-input"
                      />
                      {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Vehicle info */}
                <div>
                  <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand/10 text-brand text-xs flex items-center justify-center font-bold">2</span>
                    Дані про автомобіль
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Марка</label>
                      <input
                        type="text"
                        placeholder="Наприклад: BMW"
                        {...register("make")}
                        className="w-full premium-input"
                      />
                      {errors.make && <span className="text-xs text-red-500 mt-1">{errors.make.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Модель</label>
                      <input
                        type="text"
                        placeholder="Наприклад: 3 Series"
                        {...register("model")}
                        className="w-full premium-input"
                      />
                      {errors.model && <span className="text-xs text-red-500 mt-1">{errors.model.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Рік випуску</label>
                      <input
                        type="number"
                        placeholder="Наприклад: 2018"
                        {...register("year")}
                        className="w-full premium-input"
                      />
                      {errors.year && <span className="text-xs text-red-500 mt-1">{errors.year.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Пробіг (тис. км)</label>
                      <input
                        type="number"
                        placeholder="Наприклад: 120"
                        {...register("mileage")}
                        className="w-full premium-input"
                      />
                      {errors.mileage && <span className="text-xs text-red-500 mt-1">{errors.mileage.message}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">VIN-код автомобіля (17 символів)</label>
                    <input
                      type="text"
                      placeholder="Введіть 17-значний VIN"
                      maxLength={17}
                      {...register("vin")}
                      className="w-full premium-input font-mono uppercase tracking-widest"
                    />
                    {errors.vin && <span className="text-xs text-red-500 mt-1">{errors.vin.message}</span>}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-brand hover:bg-brand-hover text-background text-sm font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Надсилання заявки...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Надіслати на оцінку</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

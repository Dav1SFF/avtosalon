"use client";

import React, { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { RefreshCw, Send, CheckCircle, DollarSign } from "lucide-react";

const buybackSchema = zod.object({
  name: zod.string().min(2, "Введіть ваше ім'я"),
  phone: zod.string().min(10, "Введіть коректний номер телефону"),
  make: zod.string().min(2, "Введіть марку автомобіля"),
  model: zod.string().min(1, "Введіть модель автомобіля"),
  year: zod.coerce.number().min(1990).max(new Date().getFullYear()),
  mileage: zod.coerce.number().min(0, "Пробіг повинен бути позитивним"),
  price: zod.coerce.number().min(1, "Введіть бажану вартість автомобіля"),
  condition: zod.string().min(5, "Опишіть стан авто детальніше (мінімум 5 символів)"),
});

type BuybackFormValues = zod.infer<typeof buybackSchema>;

export default function BuybackPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buybackSchema),
  });

  const onSubmit = async (values: BuybackFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "BUYBACK",
          name: values.name,
          phone: values.phone,
          details: {
            make: values.make,
            model: values.model,
            year: values.year,
            mileage: values.mileage,
            price: values.price,
            condition: values.condition,
          },
        }),
      });

      if (res.ok) {
        setSuccess(true);
        reset();
      }
    } catch (error) {
      console.error("Buyback Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest block mb-2">Швидкий викуп</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase leading-tight font-sans">
              Терміновий <span className="text-brand">Автовикуп</span>
            </h1>
            <p className="text-sm text-text-gray mt-4 max-w-lg mx-auto">
              Отримайте до 95% від ринкової вартості вашого авто за 1 годину. Ми беремо на себе всі витрати з переоформлення документів.
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
                  Дякуємо за звернення. Наш спеціаліст зв'яжеться з вами найближчим часом для швидкого огляду та обговорення вартості викупу.
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
                
                {/* Contact Data */}
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

                {/* Car Details */}
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
                        placeholder="Наприклад: Mercedes-Benz"
                        {...register("make")}
                        className="w-full premium-input"
                      />
                      {errors.make && <span className="text-xs text-red-500 mt-1">{errors.make.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Модель</label>
                      <input
                        type="text"
                        placeholder="Наприклад: E-Class"
                        {...register("model")}
                        className="w-full premium-input"
                      />
                      {errors.model && <span className="text-xs text-red-500 mt-1">{errors.model.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Рік випуску</label>
                      <input
                        type="number"
                        placeholder="2019"
                        {...register("year")}
                        className="w-full premium-input text-center"
                      />
                      {errors.year && <span className="text-xs text-red-500 mt-1">{errors.year.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Пробіг (тис. км)</label>
                      <input
                        type="number"
                        placeholder="95"
                        {...register("mileage")}
                        className="w-full premium-input text-center"
                      />
                      {errors.mileage && <span className="text-xs text-red-500 mt-1">{errors.mileage.message}</span>}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Бажана ціна ($)</label>
                      <input
                        type="number"
                        placeholder="18000"
                        {...register("price")}
                        className="w-full premium-input text-center"
                      />
                      {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price.message}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Стан автомобіля (пошкодження, ремонти)</label>
                    <textarea
                      placeholder="Опишіть технічний та візуальний стан автомобіля..."
                      rows={4}
                      {...register("condition")}
                      className="w-full premium-input resize-none"
                    />
                    {errors.condition && <span className="text-xs text-red-500 mt-1">{errors.condition.message}</span>}
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
                        <span>Запросити оцінку та викуп</span>
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

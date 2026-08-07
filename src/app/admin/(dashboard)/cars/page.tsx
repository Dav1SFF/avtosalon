"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, Eye, Printer, Sparkles, Search, Smartphone, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Car {
  id: string;
  make: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  engine: string;
  transmission: string;
  drive: string;
  body: string;
  color: string;
  status: string;
  images: string;
  description: string;
  specs: string;
  equipment: string;
  serviceHistory: string;
  buyPrice?: number | null;
  expenses?: number | null;
  expenseLog?: string | null;
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Drawer Modal states
  // Form Drawer Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);

  // Session & Role
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Form Fields State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [engine, setEngine] = useState("2.0 бензин");
  const [transmission, setTransmission] = useState("Автомат");
  const [drive, setDrive] = useState("Повний привід");
  const [body, setBody] = useState("Седан");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [status, setStatus] = useState("IN_STOCK");

  // Specs Sub-fields
  const [engineVol, setEngineVol] = useState("");
  const [power, setPower] = useState("");
  const [acceleration, setAcceleration] = useState("");
  const [maxSpeed, setMaxSpeed] = useState("");
  const [consumption, setConsumption] = useState("");

  // Equipment List
  const [eqText, setEqText] = useState("");

  // Service History & Expenses
  const [serviceHistory, setServiceHistory] = useState<{ date: string; mileage: number; type: string; note: string }[]>([]);
  const [expenseLog, setExpenseLog] = useState<{ date: string; type: string; amount: number; note: string }[]>([]);
  const [buyPrice, setBuyPrice] = useState("");

  // Image Upload State
  const [uploadingImages, setUploadingImages] = useState(false);

  // AI & VIN States
  const [vinInput, setVinInput] = useState("");
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploadingImages(true);
    const files = Array.from(e.target.files);
    const newUrls: string[] = [];

    try {
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("image", file);
          
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) {
            console.error(`Upload failed for ${file.name}: ${res.statusText}`);
            continue;
          }
          
          const data = await res.json();
          if (data.url) {
            newUrls.push(data.url);
          }
        } catch (innerErr) {
          console.error(`Error uploading ${file.name}:`, innerErr);
        }
      }

      if (newUrls.length > 0) {
        setImageUrls(prev => prev ? `${prev}\n${newUrls.join("\n")}` : newUrls.join("\n"));
      }
      
      if (newUrls.length < files.length) {
        alert(`Завантажено ${newUrls.length} з ${files.length} фото. Деякі файли могли бути занадто великими (ліміт сервера).`);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Помилка завантаження фото");
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleDecodeVIN = async () => {
    if (!vinInput || vinInput.length !== 17) {
      alert("VIN код має бути довжиною 17 символів");
      return;
    }
    setIsDecodingVin(true);
    try {
      const res = await fetch(`/api/admin/decode-vin?vin=${vinInput}`);
      const data = await res.json();
      if (res.ok) {
        if (data.make) setMake(data.make);
        if (data.model) setModel(data.model);
        if (data.year) setYear(data.year.toString());
        if (data.body) setBody(data.body);
        if (data.engine) setEngine(data.engine);
        if (data.drive) setDrive(data.drive);
        if (data.transmission) setTransmission(data.transmission);
        if (data.engineVol) setEngineVol(data.engineVol);
        if (data.power) setPower(data.power);
      } else {
        alert(data.error || "Не вдалося розшифрувати VIN");
      }
    } catch (e) {
      alert("Помилка мережі при розшифровці");
    } finally {
      setIsDecodingVin(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!make || !model) {
      alert("Спочатку вкажіть хоча б Марку та Модель авто!");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/admin/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, year, mileage, engine, transmission, body })
      });
      const data = await res.json();
      if (res.ok && data.description) {
        setDescription(data.description);
      } else {
        alert("Не вдалося згенерувати опис");
      }
    } catch (e) {
      alert("Помилка генерації");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cars?limit=100&includePending=true");
      const data = await res.json();
      if (data.cars) {
        setCars(data.cars);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleEditClick = (car: Car) => {
    setEditingCarId(car.id);
    setMake(car.make);
    setModel(car.model);
    setPrice(car.price.toString());
    setYear(car.year.toString());
    setMileage(car.mileage.toString());
    setEngine(car.engine);
    setTransmission(car.transmission);
    setDrive(car.drive);
    setBody(car.body);
    setColor(car.color);
    setDescription(car.description);
    setStatus(car.status);
    
    // Parse JSON images
    try {
      if (typeof car.images === 'string' && car.images.trim().startsWith('[')) {
        const parsedImages = JSON.parse(car.images);
        setImageUrls(Array.isArray(parsedImages) ? parsedImages.join("\n") : car.images);
      } else {
        setImageUrls(car.images || "");
      }
    } catch (e) {
      setImageUrls(typeof car.images === 'string' ? car.images : "");
    }

    // Parse JSON specs
    try {
      const parsedSpecs = typeof car.specs === 'string' && car.specs.trim().startsWith('{') 
        ? JSON.parse(car.specs) 
        : {};
      setEngineVol(parsedSpecs.engineVol || "");
      setPower(parsedSpecs.power || "");
      setAcceleration(parsedSpecs.acceleration || "");
      setMaxSpeed(parsedSpecs.maxSpeed || "");
      setConsumption(parsedSpecs.consumption || "");
    } catch (e) {
      setEngineVol("");
      setPower("");
      setAcceleration("");
      setMaxSpeed("");
      setConsumption("");
    }

    // Parse JSON equipment
    try {
      if (typeof car.equipment === 'string' && car.equipment.trim().startsWith('[')) {
        const parsedEquipment = JSON.parse(car.equipment);
        setEqText(Array.isArray(parsedEquipment) ? parsedEquipment.join(", ") : car.equipment);
      } else {
        setEqText(car.equipment || "");
      }
    } catch (e) {
      setEqText(typeof car.equipment === 'string' ? car.equipment : "");
    }

    // Parse JSON service history
    try {
      if (typeof car.serviceHistory === 'string' && car.serviceHistory.trim().startsWith('[')) {
        const parsedHistory = JSON.parse(car.serviceHistory);
        setServiceHistory(Array.isArray(parsedHistory) ? parsedHistory : []);
      } else {
        setServiceHistory([]);
      }
    } catch (e) {
      setServiceHistory([]);
    }

    // Admin Finances
    setBuyPrice(car.buyPrice ? car.buyPrice.toString() : "");
    try {
      if (typeof car.expenseLog === 'string' && car.expenseLog.trim().startsWith('[')) {
        const parsedExps = JSON.parse(car.expenseLog);
        setExpenseLog(Array.isArray(parsedExps) ? parsedExps : []);
      } else {
        setExpenseLog([]);
      }
    } catch (e) {
      setExpenseLog([]);
    }

    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingCarId(null);
    setMake("");
    setModel("");
    setPrice("");
    setYear("");
    setMileage("");
    setEngine("2.0 бензин");
    setTransmission("Автомат");
    setDrive("Повний привід");
    setBody("Седан");
    setColor("");
    setDescription("");
    setImageUrls("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800");
    setStatus("IN_STOCK");
    
    setEngineVol("1998 см³");
    setPower("258 к.с.");
    setAcceleration("5.8 с");
    setMaxSpeed("250 км/год");
    setConsumption("7.2 л/100км");
    
    setEqText("Шкіряний салон, Камера 360, Адаптивний круїз");
    setServiceHistory([]);
    setExpenseLog([]);
    setBuyPrice("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parsedImages = imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const parsedSpecs = {
      engineVol,
      power,
      acceleration,
      maxSpeed,
      consumption,
    };

    const parsedEquipment = eqText
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const totalExpenses = expenseLog.reduce((sum, item) => sum + (item.amount || 0), 0);

    const payload: any = {
      make,
      model,
      price,
      year,
      mileage,
      engine,
      transmission,
      drive,
      body,
      color,
      description,
      images: parsedImages,
      specs: parsedSpecs,
      equipment: parsedEquipment,
      serviceHistory,
      status,
    };

    if (isAdmin) {
      payload.buyPrice = buyPrice;
      payload.expenses = totalExpenses.toString();
      payload.expenseLog = expenseLog;
    }

    try {
      const url = editingCarId ? `/api/cars/${editingCarId}` : "/api/cars";
      const method = editingCarId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCars();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей автомобіль?")) return;
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCars();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (carId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchCars();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-brand uppercase tracking-wider">Керування автопарком</span>
          <h1 className="text-3xl font-extrabold text-white mt-1 uppercase">Автомобілі</h1>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand text-background font-bold text-xs uppercase tracking-wider hover:bg-brand-hover transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Додати автомобіль
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-10 h-10 text-brand animate-spin" />
        </div>
      ) : cars.length === 0 ? (
        <div className="glass p-16 rounded-[24px] border border-white/5 text-center text-text-gray">
          Немає доданих автомобілів. Натисніть кнопку вище, щоб додати перше авто.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {cars.map((car) => {
            let imgs = [];
            try {
              imgs = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
            } catch(e) {}
            const firstImg = (imgs && imgs.length > 0) ? imgs[0] : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800";
            
            // Calculate Financials for Admin
            let margin = null;
            if (isAdmin && car.buyPrice) {
              margin = car.price - car.buyPrice - (car.expenses || 0);
            }

            return (
              <div key={car.id} className={`glass rounded-[24px] border border-white/5 overflow-hidden flex flex-col hover:border-brand/30 transition shadow-2xl ${car.status === 'PENDING' ? 'ring-1 ring-orange-500/50' : ''}`}>
                <div className="flex flex-col sm:flex-row p-6 gap-6">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 aspect-[16/10] sm:aspect-square rounded-2xl overflow-hidden shrink-0 bg-black/40">
                    <Image src={firstImg} alt={car.model || "Car"} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                      <select
                        value={car.status}
                        onChange={(e) => handleStatusChange(car.id, e.target.value)}
                        className={`py-1 px-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border-0 appearance-none shadow-lg backdrop-blur-md cursor-pointer ${car.status === 'PENDING' ? 'bg-orange-500/90 text-white' : car.status === 'SOLD' ? 'bg-black/80 text-text-gray' : 'bg-brand/90 text-background'}`}
                      >
                        <option value="PENDING">Очікує</option>
                        <option value="IN_STOCK">В наявності</option>
                        <option value="BOOKED">Бронь</option>
                        <option value="SOLD">Продано</option>
                      </select>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h2 className="text-xl font-extrabold text-white leading-tight">{car.make} {car.model}</h2>
                        <span className="text-xs text-text-gray font-semibold uppercase">{car.engine} • {car.transmission}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-black text-brand leading-none">{car.price.toLocaleString("uk-UA")} $</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 mt-2">
                      <div>
                        <span className="block text-[10px] text-text-gray uppercase font-bold tracking-wider mb-1">Рік</span>
                        <span className="block text-sm font-semibold text-white">{car.year}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-text-gray uppercase font-bold tracking-wider mb-1">Пробіг</span>
                        <span className="block text-sm font-semibold text-white">{(car.mileage / 1000).toFixed(0)} тис. км</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-text-gray uppercase font-bold tracking-wider mb-1">Привід</span>
                        <span className="block text-sm font-semibold text-white truncate max-w-[80px]">{car.drive}</span>
                      </div>
                    </div>

                    {/* Admin Financials Inline */}
                    {isAdmin && (
                      <div className="mt-auto pt-4 flex gap-3">
                        <div className="flex-1 bg-black/20 rounded-xl p-3 border border-white/5">
                          <span className="block text-[9px] text-text-gray uppercase font-bold tracking-wider mb-0.5">Собівартість (Викуп + Витрати)</span>
                          <span className="block text-sm font-bold text-white">
                            {car.buyPrice ? `$${(car.buyPrice + (car.expenses || 0)).toLocaleString("uk-UA")}` : "Не вказано"}
                          </span>
                        </div>
                        <div className={`flex-1 rounded-xl p-3 border ${margin !== null && margin > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-black/20 border-white/5'}`}>
                          <span className="block text-[9px] text-text-gray uppercase font-bold tracking-wider mb-0.5">Очікуваний Прибуток</span>
                          <span className={`block text-sm font-bold ${margin !== null && margin > 0 ? 'text-green-400' : 'text-white'}`}>
                            {margin !== null ? `$${margin.toLocaleString("uk-UA")}` : "—"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="mt-auto bg-black/20 border-t border-white/5 p-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <Link
                      href={`/catalog/${car.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> На сайт
                    </Link>
                    <Link
                      href={`/admin/story/${car.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-tr from-yellow-500/20 to-purple-500/20 hover:from-yellow-500 hover:to-purple-500 text-white text-xs font-semibold transition border border-white/5"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Story
                    </Link>
                    <Link
                      href={`/admin/print/${car.id}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-green-500/10 hover:text-green-400 text-white text-xs font-semibold transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Друк
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(car)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand/10 hover:bg-brand hover:text-background text-brand text-xs font-bold uppercase tracking-wider transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Редаг.
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-gray hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation/Editing sliding drawer modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-[#0E2A24] border-l border-white/5 w-full max-w-2xl h-screen flex flex-col justify-between p-8 overflow-y-auto animate-slideLeft">
            
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-white/5 mb-6">
                <h3 className="text-white font-extrabold text-xl uppercase tracking-wide">
                  {editingCarId ? "Редагувати автомобіль" : "Додати автомобіль"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-text-gray hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* VIN Decoder */}
                <div className="flex flex-col gap-1.5 p-4 bg-brand/5 border border-brand/20 rounded-[16px]">
                  <label className="text-xs text-brand uppercase tracking-wider font-extrabold flex items-center gap-1">
                    <Search className="w-3.5 h-3.5" /> Автозаповнення по VIN
                  </label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Введіть 17 символів VIN-коду..." value={vinInput} onChange={(e) => setVinInput(e.target.value.toUpperCase())} className="flex-grow premium-input uppercase" maxLength={17} />
                    <button type="button" onClick={handleDecodeVIN} disabled={isDecodingVin} className="px-4 py-2 bg-brand text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition disabled:opacity-50 whitespace-nowrap">
                      {isDecodingVin ? "Пошук..." : "Розшифрувати"}
                    </button>
                  </div>
                </div>

                {/* Brand & Model */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Марка</label>
                    <input type="text" required placeholder="BMW" value={make} onChange={(e) => setMake(e.target.value)} className="w-full premium-input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Модель</label>
                    <input type="text" required placeholder="M3" value={model} onChange={(e) => setModel(e.target.value)} className="w-full premium-input" />
                  </div>
                </div>

                {/* Price, Year, Mileage */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Ціна, $</label>
                    <input type="number" required placeholder="34000" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full premium-input text-center" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Рік</label>
                    <input type="number" required placeholder="2022" value={year} onChange={(e) => setYear(e.target.value)} className="w-full premium-input text-center" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Пробіг, км</label>
                    <input type="number" required placeholder="26000" value={mileage} onChange={(e) => setMileage(e.target.value)} className="w-full premium-input text-center" />
                  </div>
                </div>

                {/* Engine, Transmission, Drive, Body, Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Двигун</label>
                    <input type="text" value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full premium-input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Колір</label>
                    <input type="text" placeholder="Білий" value={color} onChange={(e) => setColor(e.target.value)} className="w-full premium-input" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Коробка</label>
                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full premium-input appearance-none">
                      <option value="Автомат">Автомат</option>
                      <option value="Механіка">Механіка</option>
                      <option value="Варіатор">Варіатор</option>
                      <option value="Робот">Робот</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Привід</label>
                    <select value={drive} onChange={(e) => setDrive(e.target.value)} className="w-full premium-input appearance-none">
                      <option value="Повний привід">Повний привід</option>
                      <option value="Передній привід">Передній привід</option>
                      <option value="Задній привід">Задній привід</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Кузов</label>
                    <select value={body} onChange={(e) => setBody(e.target.value)} className="w-full premium-input appearance-none">
                      <option value="Седан">Седан</option>
                      <option value="Кросовер">Кросовер</option>
                      <option value="Купе">Купе</option>
                    </select>
                  </div>
                </div>

                {/* Images */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Зображення (URL-адреси або Завантаження)</label>
                    <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition ${uploadingImages ? 'text-text-gray cursor-wait' : 'text-brand hover:underline'}`}>
                      {uploadingImages ? "Завантаження..." : "+ Вибрати файли"}
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImages} />
                    </label>
                  </div>
                  <textarea rows={3} value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} className="w-full premium-input resize-none" placeholder="https://...\nhttps://..." />
                </div>

                {/* Specs JSON Details */}
                <div className="border-t border-white/5 pt-4">
                  <span className="block text-white font-bold text-xs uppercase tracking-wider mb-3">Специфікації (Характеристики)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Об'єм: 1998 см³" value={engineVol} onChange={(e) => setEngineVol(e.target.value)} className="premium-input text-xs" />
                    <input type="text" placeholder="Потужність: 258 к.с." value={power} onChange={(e) => setPower(e.target.value)} className="premium-input text-xs" />
                    <input type="text" placeholder="Розгін: 5.8 с" value={acceleration} onChange={(e) => setAcceleration(e.target.value)} className="premium-input text-xs" />
                    <input type="text" placeholder="Витрата: 7.2 л/100км" value={consumption} onChange={(e) => setConsumption(e.target.value)} className="premium-input text-xs" />
                  </div>
                </div>

                {/* Equipment (comma separated) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Комплектація (через кому)</label>
                  <input type="text" value={eqText} onChange={(e) => setEqText(e.target.value)} className="w-full premium-input" />
                </div>

                {/* Service History */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="block text-white font-bold text-xs uppercase tracking-wider">Історія обслуговування</span>
                    <button
                      type="button"
                      onClick={() => setServiceHistory([...serviceHistory, { date: "", mileage: 0, type: "", note: "" }])}
                      className="text-brand text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Додати запис
                    </button>
                  </div>
                  {serviceHistory.map((sh, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 relative space-y-3">
                      <button
                        type="button"
                        onClick={() => setServiceHistory(serviceHistory.filter((_, i) => i !== idx))}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Дата (напр. 15.08.2024)" value={sh.date} onChange={(e) => { const newHistory = [...serviceHistory]; newHistory[idx].date = e.target.value; setServiceHistory(newHistory); }} className="premium-input text-xs" required />
                        <input type="number" placeholder="Пробіг (напр. 120000)" value={sh.mileage || ""} onChange={(e) => { const newHistory = [...serviceHistory]; newHistory[idx].mileage = parseInt(e.target.value) || 0; setServiceHistory(newHistory); }} className="premium-input text-xs" required />
                        <input type="text" placeholder="Тип робіт (ТО, Ремонт)" value={sh.type} onChange={(e) => { const newHistory = [...serviceHistory]; newHistory[idx].type = e.target.value; setServiceHistory(newHistory); }} className="premium-input text-xs" required />
                        <input type="text" placeholder="Опис робіт (заміна масла...)" value={sh.note} onChange={(e) => { const newHistory = [...serviceHistory]; newHistory[idx].note = e.target.value; setServiceHistory(newHistory); }} className="premium-input text-xs" required />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin Financials (Expense Log & Buy Price) */}
                {isAdmin && (
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <div className="flex justify-between items-center bg-brand/5 p-4 rounded-xl border border-brand/20">
                      <div>
                        <span className="block text-brand font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> Фінанси (тільки для Власника)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-text-gray font-semibold">Ціна викупу, $:</label>
                        <input type="number" placeholder="25000" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} className="premium-input text-xs w-24 text-center" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <span className="block text-white font-bold text-xs uppercase tracking-wider">Журнал витрат</span>
                      <button
                        type="button"
                        onClick={() => setExpenseLog([...expenseLog, { date: "", type: "", amount: 0, note: "" }])}
                        className="text-green-400 text-xs font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Додати витрату
                      </button>
                    </div>

                    {expenseLog.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-green-500/5 rounded-xl border border-green-500/10 relative space-y-3">
                        <button
                          type="button"
                          onClick={() => setExpenseLog(expenseLog.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-4 gap-3">
                          <input type="text" placeholder="Дата (напр. 15.08)" value={exp.date} onChange={(e) => { const newLog = [...expenseLog]; newLog[idx].date = e.target.value; setExpenseLog(newLog); }} className="premium-input text-xs" required />
                          <input type="text" placeholder="Тип (Ремонт, ТО)" value={exp.type} onChange={(e) => { const newLog = [...expenseLog]; newLog[idx].type = e.target.value; setExpenseLog(newLog); }} className="premium-input text-xs" required />
                          <input type="number" placeholder="Сума $" value={exp.amount || ""} onChange={(e) => { const newLog = [...expenseLog]; newLog[idx].amount = parseInt(e.target.value) || 0; setExpenseLog(newLog); }} className="premium-input text-xs font-bold text-green-400" required />
                          <input type="text" placeholder="Коментар" value={exp.note} onChange={(e) => { const newLog = [...expenseLog]; newLog[idx].note = e.target.value; setExpenseLog(newLog); }} className="premium-input text-xs" required />
                        </div>
                      </div>
                    ))}
                    
                    {expenseLog.length > 0 && (
                      <div className="flex justify-end pr-2">
                        <span className="text-xs text-text-gray font-semibold">Разом витрат: <span className="text-brand text-sm">${expenseLog.reduce((sum, item) => sum + (item.amount || 0), 0)}</span></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-text-gray uppercase tracking-wider font-semibold">Опис автомобіля</label>
                    <button type="button" onClick={handleGenerateAI} disabled={isGeneratingAI} className="text-brand text-xs font-bold uppercase flex items-center gap-1 hover:underline disabled:opacity-50 transition">
                      <Sparkles className="w-3.5 h-3.5" /> {isGeneratingAI ? "Генерую..." : "Згенерувати AI"}
                    </button>
                  </div>
                  <textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full premium-input resize-none" placeholder="Введіть опис або натисніть Згенерувати AI..." />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-brand hover:bg-brand-hover text-background text-sm font-bold uppercase tracking-wider rounded-xl transition"
                  >
                    {submitting ? "Збереження..." : "Зберегти автомобіль"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

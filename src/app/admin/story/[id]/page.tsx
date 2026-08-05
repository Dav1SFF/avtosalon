"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";

interface Car {
  make: string;
  model: string;
  price: number;
  year: number;
  mileage: number;
  engine: string;
  transmission: string;
  images: string;
  description: string;
}

export default function StoryGeneratorPage() {
  const params = useParams();
  const id = params.id as string;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.car) setCar(data.car);
        setLoading(false);
      });
  }, [id]);

  const handleDownload = async () => {
    if (!storyRef.current) return;
    setGenerating(true);
    try {
      const dataUrl = await toPng(storyRef.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `story-${car?.make}-${car?.model}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      alert("Не вдалося згенерувати зображення");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#071E1A]"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  if (!car) return <div className="min-h-screen flex items-center justify-center bg-[#071E1A] text-white">Авто не знайдено</div>;

  let firstImg = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=800";
  try {
    const imgs = typeof car.images === 'string' ? JSON.parse(car.images) : car.images;
    if (imgs && imgs.length > 0) firstImg = imgs[0];
  } catch(e) {}

  return (
    <div className="min-h-screen bg-[#0E2A24] flex flex-col items-center py-10 overflow-auto">
      <div className="flex justify-between items-center w-full max-w-[1080px] px-8 mb-8">
        <div>
          <h1 className="text-white text-3xl font-extrabold uppercase">Instagram Story</h1>
          <p className="text-text-gray mt-2 text-sm">Генератор макету (1080x1920)</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex items-center gap-3 bg-brand hover:bg-brand-hover text-background px-8 py-4 rounded-2xl font-bold uppercase tracking-wider transition disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {generating ? "Генерація..." : "Завантажити Story"}
        </button>
      </div>

      {/* 1080x1920 Container for export */}
      <div 
        ref={storyRef}
        style={{ width: '1080px', height: '1920px' }} 
        className="relative bg-[#071E1A] overflow-hidden shrink-0 shadow-2xl shadow-black/50"
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image src={firstImg} alt="Car" fill className="object-cover object-center opacity-80" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071E1A] via-[#071E1A]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-16 pb-24 z-10">
          {/* Top Logo */}
          <div className="flex justify-center">
             <div className="text-center">
              <span className="text-brand text-6xl font-black uppercase tracking-widest leading-none drop-shadow-lg block">VIDKRYTYI</span>
              <span className="text-white/80 text-xl font-bold uppercase tracking-[0.2em] mt-2 block">Відкрито про автомобілі</span>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex flex-col gap-12">
            <div className="space-y-4">
              <h2 className="text-white text-[120px] font-black uppercase leading-none drop-shadow-2xl">{car.make} <br/><span className="text-brand">{car.model}</span></h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6 gap-y-12 bg-black/40 backdrop-blur-md p-10 rounded-3xl border border-white/10">
              <div>
                <span className="block text-brand text-3xl font-bold uppercase tracking-widest mb-2">Рік випуску</span>
                <span className="block text-white text-6xl font-black">{car.year}</span>
              </div>
              <div>
                <span className="block text-brand text-3xl font-bold uppercase tracking-widest mb-2">Пробіг</span>
                <span className="block text-white text-6xl font-black">{(car.mileage / 1000).toFixed(0)} тис.</span>
              </div>
              <div>
                <span className="block text-brand text-3xl font-bold uppercase tracking-widest mb-2">Двигун</span>
                <span className="block text-white text-5xl font-black">{car.engine}</span>
              </div>
              <div>
                <span className="block text-brand text-3xl font-bold uppercase tracking-widest mb-2">Коробка</span>
                <span className="block text-white text-5xl font-black">{car.transmission}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center p-10 bg-brand rounded-3xl shadow-2xl">
              <span className="text-background/80 text-3xl font-bold uppercase tracking-widest mb-2">Ціна</span>
              <span className="text-background text-[110px] font-black leading-none">${car.price.toLocaleString("uk-UA")}</span>
            </div>
            
            <div className="flex flex-col items-center mt-12 animate-bounce">
               <span className="text-white text-4xl font-bold uppercase tracking-widest">Пиши в Direct</span>
               <div className="text-brand mt-4">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

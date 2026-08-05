import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QRCode from "react-qr-code";
import PrintTrigger from "./PrintTrigger";
import { headers } from "next/headers";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  
  const car = await prisma.car.findUnique({
    where: { id },
  });

  if (!car) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get('host') || "avtosalon-puce.vercel.app";
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;
  const carUrl = `${siteUrl}/catalog/${car.id}`;
  
  let parsedEquipment = [];
  try {
    parsedEquipment = JSON.parse(car.equipment);
  } catch(e) {}

  return (
    <div className="bg-white min-h-screen text-black font-sans print-page">
      <PrintTrigger />
      
      {/* 
        A4 size: 210mm x 297mm. 
      */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-8 border border-gray-200 print:border-none print:p-4 flex flex-col justify-between relative">
        
        {/* Header - HUGE */}
        <div className="border-b-8 border-[#0E2A24] pb-6 mb-8 text-center">
          <h1 className="text-[6.5rem] font-black text-[#0E2A24] uppercase tracking-tighter leading-[0.9] mb-4">
            {car.make} <br/> <span className="text-[#B39359]">{car.model}</span>
          </h1>
          <div className="bg-[#0E2A24] text-white inline-block px-8 py-4 rounded-3xl mt-4">
             <h2 className="text-7xl font-black">
               {car.price.toLocaleString("uk-UA")} <span className="text-[#B39359]">$</span>
             </h2>
          </div>
        </div>

        {/* Specs Grid - HUGE */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="text-3xl font-black text-gray-400 uppercase tracking-widest border-b-4 pb-2">Рік</div>
              <div className="text-6xl font-black text-[#0E2A24]">{car.year}</div>
            </div>
            <div className="space-y-6">
              <div className="text-3xl font-black text-gray-400 uppercase tracking-widest border-b-4 pb-2">Пробіг</div>
              <div className="text-6xl font-black text-[#0E2A24]">{(car.mileage / 1000).toFixed(0)} <span className="text-4xl text-gray-500">тис. км</span></div>
            </div>
            <div className="space-y-6">
              <div className="text-3xl font-black text-gray-400 uppercase tracking-widest border-b-4 pb-2">Двигун</div>
              <div className="text-5xl font-black text-[#0E2A24] leading-tight">{car.engine}</div>
            </div>
            <div className="space-y-6">
              <div className="text-3xl font-black text-gray-400 uppercase tracking-widest border-b-4 pb-2">Коробка</div>
              <div className="text-5xl font-black text-[#0E2A24] leading-tight">{car.transmission}</div>
            </div>
          </div>
        </div>

        {/* Footer with HUGE QR */}
        <div className="mt-8 pt-8 border-t-8 border-[#0E2A24] flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-5xl font-black text-[#0E2A24] mb-4 uppercase tracking-widest">VIDKRYTYI</h3>
            <p className="text-4xl font-bold text-[#B39359]">+380 99 999 99 99</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 border-8 border-[#0E2A24] rounded-3xl bg-white">
              <QRCode value={carUrl} size={250} fgColor="#0E2A24" />
            </div>
            <span className="text-2xl font-black text-gray-800 uppercase tracking-widest">Скануй фото</span>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background-color: white !important;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          header, footer, nav, .sidebar {
            display: none !important;
          }
          .print-page {
            padding: 10mm;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      `}} />
    </div>
  );
}

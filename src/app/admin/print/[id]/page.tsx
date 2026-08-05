import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QRCode from "react-qr-code";
import PrintTrigger from "./PrintTrigger";

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

  const siteUrl = process.env.NEXTAUTH_URL || "https://vidkrytyi.com.ua";
  const carUrl = `${siteUrl}/catalog/${car.id}`;
  
  let parsedEquipment = [];
  try {
    parsedEquipment = JSON.parse(car.equipment);
  } catch(e) {}

  return (
    <div className="bg-white min-h-screen text-black font-sans print-page p-8">
      <PrintTrigger />
      
      {/* 
        A4 size: 210mm x 297mm. 
        We use an explicit container that matches A4 proportions for preview 
      */}
      <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white p-12 border border-gray-200 print:border-none print:p-0 flex flex-col justify-between relative shadow-2xl print:shadow-none">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-[#0E2A24] pb-6 mb-8">
          <div>
            <h1 className="text-6xl font-extrabold text-[#0E2A24] uppercase tracking-tighter leading-none">
              {car.make} <span className="text-[#B39359]">{car.model}</span>
            </h1>
            <p className="text-2xl text-gray-500 font-bold mt-2">
              {car.year} рік • {(car.mileage / 1000).toFixed(0)} тис. км
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-5xl font-black text-[#0E2A24]">
              {car.price.toLocaleString("uk-UA")} <span className="text-[#B39359]">$</span>
            </h2>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400 border-b pb-2">Характеристики</h3>
            <ul className="space-y-3 text-lg font-semibold">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Двигун</span>
                <span className="text-right">{car.engine}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Коробка</span>
                <span className="text-right">{car.transmission}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Привід</span>
                <span className="text-right">{car.drive}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Кузов</span>
                <span className="text-right">{car.body}</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Колір</span>
                <span className="text-right">{car.color}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-400 border-b pb-2">Комплектація</h3>
            <ul className="space-y-2 text-md font-medium text-gray-800 list-disc pl-5">
              {parsedEquipment.slice(0, 12).map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
              {parsedEquipment.length > 12 && <li className="text-gray-400 italic">та інші опції...</li>}
            </ul>
          </div>
        </div>

        {/* Footer with QR */}
        <div className="mt-auto pt-8 border-t-4 border-[#0E2A24] flex items-center justify-between">
          <div className="flex-1 pr-8">
            <h3 className="text-4xl font-black text-[#0E2A24] mb-2 uppercase tracking-widest">VIDKRYTYI</h3>
            <p className="text-lg text-gray-600 font-bold">Автосалон перевірених автомобілів</p>
            <p className="text-lg text-gray-600 font-semibold mt-1">м. Дніпро</p>
            <p className="text-3xl font-bold text-[#B39359] mt-4">+380 99 999 99 99</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 border-4 border-[#0E2A24] rounded-2xl bg-white shadow-xl print:shadow-none">
              <QRCode value={carUrl} size={160} fgColor="#0E2A24" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Деталі та фото</span>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
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
            padding: 15mm;
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

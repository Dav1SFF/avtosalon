import React from "react";
import PublicLayout from "@/components/PublicLayout";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="glass p-8 sm:p-12 rounded-[24px] border border-white/5 space-y-6 text-sm text-text-gray leading-relaxed">
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase mb-8">Політика конфіденційності</h1>
            
            <p>
              Ця Політика конфіденційності описує, як автосалон <strong>VIDKRYTYI</strong> збирає, використовує та захищає вашу особисту інформацію при використанні нашого веб-сайту.
            </p>

            <h3 className="text-white font-bold text-base mt-6">1. Збір особистих даних</h3>
            <p>
              Ми можемо збирати особисту інформацію, таку як ваше ім'я, номер телефону та електронну адресу, лише тоді, коли ви добровільно надаєте її нам через форми зворотного зв'язку, Trade-In, автовикупу чи бронювання.
            </p>

            <h3 className="text-white font-bold text-base mt-6">2. Використання інформації</h3>
            <p>
              Будь-яка інформація, яку ми збираємо від вас, може бути використана для:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Зв'язку з вами щодо ваших заявок;</li>
              <li>Надання консультацій стосовно послуг автосалону;</li>
              <li>Покращення обслуговування клієнтів.</li>
            </ul>

            <h3 className="text-white font-bold text-base mt-6">3. Захист даних</h3>
            <p>
              Ми впроваджуємо різноманітні заходи безпеки для збереження конфіденційності ваших персональних даних. Ваша інформація зберігається у захищених базах даних та ніколи не передається третім особам без вашої прямої згоди.
            </p>

            <h3 className="text-white font-bold text-base mt-6">4. Згода</h3>
            <p>
              Користуючись нашим сайтом, ви погоджуєтеся з нашою політикою конфіденційності.
            </p>

            <p className="text-[11px] text-text-gray/50 pt-8 border-t border-white/5">
              Останнє оновлення: 20 липня 2026 року
            </p>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import React from "react";
import PublicLayout from "@/components/PublicLayout";
import { Phone, MapPin, Clock, Mail, Send } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function ContactsPage() {
  return (
    <PublicLayout>
      <div className="bg-[#071E1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand uppercase tracking-widest block mb-2">Наші контакти</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase leading-tight font-sans">
              Зв'язатися з <span className="text-brand">намі</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Info details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass p-8 rounded-[24px] border border-white/5 space-y-6">
                <h3 className="text-white font-bold text-lg uppercase tracking-wide">Адреса та Зв'язок</h3>

                <ul className="space-y-6 text-sm text-text-gray">
                  <li className="flex items-start gap-4">
                    <MapPin className="w-5.5 h-5.5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-white font-semibold mb-1">Салон у Києві</span>
                      <span>Київ, Столичне шосе, 104 (авторинок "Центральний", критий сектор)</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <Phone className="w-5.5 h-5.5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-white font-semibold mb-1">Номер телефону</span>
                      <a href="tel:+380958009476" className="hover:text-brand transition text-white font-bold">
                        (095) 800-94-76
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <Clock className="w-5.5 h-5.5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-white font-semibold mb-1">Робочі години</span>
                      <span>Пн-Пт: 09:00 - 19:00</span>
                      <span className="block">Сб-Нд: 10:00 - 18:00</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <Mail className="w-5.5 h-5.5 text-brand shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-white font-semibold mb-1">Електронна пошта</span>
                      <a href="mailto:info@vidkrytyi.com.ua" className="hover:text-brand transition">
                        info@vidkrytyi.com.ua
                      </a>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Social Channels */}
              <div className="glass p-8 rounded-[24px] border border-white/5 space-y-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-wide">Ми у соцмережах</h4>
                <div className="flex gap-4">
                  <a
                    href="https://t.me/avp_kyiv"
                    target="_blank"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand text-white font-semibold text-xs uppercase tracking-wider transition"
                  >
                    <Send className="w-4 h-4 fill-current text-brand" />
                    Telegram Channel
                  </a>
                  <a
                    href="https://instagram.com/avp_kyiv"
                    target="_blank"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-brand text-white font-semibold text-xs uppercase tracking-wider transition"
                  >
                    <InstagramIcon className="w-4 h-4 text-brand" />
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Google Map Embedded container */}
            <div className="lg:col-span-7 h-[450px] w-full rounded-[24px] overflow-hidden border border-white/5 shadow-2xl relative bg-black/40">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m13!1m11!1m3!1d20364.55160877965!2d30.561491763788737!3d50.34758763737225!2m2!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c680db9a6a8b%3A0xcb1b70db6422709e!2z0KHRgtC-0LvQuNGH0L3QvtC1INGI0L7RgdGB0LUsIDEwNCwg0JrQuNC10LIsIDAyMDAw!5e0!3m2!1suk!2sua!4v1700000000000!5m2!1suk!2sua"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale opacity-85 invert contrast-125"
              />
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}

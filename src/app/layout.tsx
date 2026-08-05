import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "VIDKRYTYI | Відкрито про автомобілі",
  description: "Преміальний автосалон VIDKRYTYI. Понад 1000 проданих автомобілів. Трейд-ін, лізинг, автовикуп та продаж перевірених автомобілів у Києві.",
  keywords: ["автосалон", "купити авто київ", "трейд-ін", "автовикуп", "лізинг авто", "вживані авто", "VIDKRYTYI"],
  authors: [{ name: "VIDKRYTYI" }],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "https://vidkrytyi.com.ua",
    title: "VIDKRYTYI | Відкрито про автомобілі",
    description: "Купуйте перевірені автомобілі з чесною історією. Трейд-ін, лізинг та автовикуп за найкращими цінами.",
    siteName: "VIDKRYTYI",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VIDKRYTYI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

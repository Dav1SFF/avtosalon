import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error("GET Leads API Error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, phone, details } = body;

    if (!type || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const lead = await prisma.lead.create({
      data: {
        type,
        name,
        phone,
        details: typeof details === "string" ? details : JSON.stringify(details || {}),
        status: "NEW",
        comments: "[]",
      },
    });

    // Format notification text for Telegram
    let telegramText = `🔔 *Нова заявка на сайті VIDKRYTYI*\n\n`;
    telegramText += `👤 *Ім'я:* ${name}\n`;
    telegramText += `📞 *Телефон:* ${phone}\n`;

    const typeLabels: Record<string, string> = {
      TRADE_IN: "🔄 Обмін / Trade-In",
      BUYBACK: "💰 Терміновий Автовикуп",
      BOOKING: "📅 Бронювання авто",
      CONTACT: "✉️ Зворотний зв'язок",
    };
    telegramText += `🏷️ *Тип заявки:* ${typeLabels[type] || type}\n`;

    if (details) {
      telegramText += `\n📝 *Деталі заявки:*\n`;
      const parsedDetails = typeof details === "string" ? JSON.parse(details) : details;
      
      if (type === "TRADE_IN") {
        telegramText += `- VIN-код: ${parsedDetails.vin || "Не вказано"}\n`;
        telegramText += `- Авто на обмін: ${parsedDetails.make || ""} ${parsedDetails.model || ""} (${parsedDetails.year || ""} р.)\n`;
        telegramText += `- Пробіг: ${parsedDetails.mileage || "0"} тис. км\n`;
      } else if (type === "BUYBACK") {
        telegramText += `- Авто для викупу: ${parsedDetails.make || ""} ${parsedDetails.model || ""} (${parsedDetails.year || ""} р.)\n`;
        telegramText += `- Очікувана ціна: ${parsedDetails.price || "Не вказано"} $\n`;
        telegramText += `- Стан авто: ${parsedDetails.condition || "Не вказано"}\n`;
      } else if (type === "BOOKING") {
        telegramText += `- ID автомобіля: ${parsedDetails.carId || "Не вказано"}\n`;
        telegramText += `- Обране авто: ${parsedDetails.carName || "Не вказано"}\n`;
        telegramText += `- Ціна авто: ${parsedDetails.carPrice || "0"} $\n`;
      } else if (type === "CONTACT") {
        telegramText += `- Повідомлення: ${parsedDetails.message || "Немає повідомлення"}\n`;
      }
    }

    // Trigger notification
    await sendTelegramMessage(telegramText, {
      inline_keyboard: [
        [
          { text: "🟢 Взяти в роботу", callback_data: `lead_progress_${lead.id}` },
          { text: "🔴 Відхилити", callback_data: `lead_reject_${lead.id}` }
        ]
      ]
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("POST Leads API Error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}

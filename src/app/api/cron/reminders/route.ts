import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

// This is required for Next.js to not cache this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Cron endpoint called without valid CRON_SECRET");
    }

    const now = new Date();
    
    const leads = await prisma.lead.findMany({
      where: {
        nextContactDate: {
          gt: now
        },
        status: {
          notIn: ["COMPLETED", "REJECTED"]
        }
      },
      include: {
        assignedUsers: {
          select: { id: true, name: true, telegramId: true }
        }
      }
    });

    const typeLabels: Record<string, string> = {
      TRADE_IN: "🔄 Trade-In",
      BUYBACK: "💰 Викуп",
      BOOKING: "📅 Бронь",
      CONTACT: "✉️ Зворотний зв'язок",
    };

    let sentCount = 0;

    for (const lead of leads) {
      if (!lead.nextContactDate) continue;
      
      const diffMs = lead.nextContactDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 1000 / 60);

      let reminderTimeText = null;

      // Cron runs every 5 minutes. Window size is 5 minutes.
      if (diffMinutes >= 175 && diffMinutes <= 180) {
        reminderTimeText = "3 часа";
      }
      else if (diffMinutes >= 55 && diffMinutes <= 60) {
        reminderTimeText = "1 час";
      }
      else if (diffMinutes >= 5 && diffMinutes <= 10) {
        reminderTimeText = "10 минут";
      }

      if (reminderTimeText) {
        // Fallback to domain if NEXT_PUBLIC_APP_URL is not set
        const domain = process.env.NEXT_PUBLIC_APP_URL || (request.headers.get("host") ? `https://${request.headers.get("host")}` : "https://avtosalon-puoe.vercel.app");
        const leadUrl = `${domain}/admin/leads/${lead.id}`;
        
        // Ensure timezone is correct (Ukraine time is usually Europe/Kyiv)
        const timeStr = lead.nextContactDate.toLocaleTimeString("ru-RU", { 
          hour: "2-digit", 
          minute: "2-digit", 
          timeZone: "Europe/Kiev" 
        });
        
        const message = `⏰ Напоминаю о звонке за *${reminderTimeText}* с клиентом *"${lead.name}"* по заявке "${typeLabels[lead.type] || lead.type}"\n\n` +
                        `📞 Звонок будет в: *${timeStr}*\n` +
                        `📱 Номер телефона: ${lead.phone}\n\n` +
                        `🔗 Ссылка на заявку: ${leadUrl}`;

        for (const user of lead.assignedUsers) {
          if (user.telegramId) {
            await sendTelegramMessage(message, undefined, user.telegramId);
            sentCount++;
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: leads.length, sentCount });
  } catch (error: any) {
    console.error("Cron Reminders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

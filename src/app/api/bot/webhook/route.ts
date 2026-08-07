import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) botToken = botToken.replace(/["']/g, "").trim();

    // Handle Callback Queries (when a user clicks an inline button)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data; // e.g. "lead_progress_123"
      const messageId = callbackQuery.message.message_id;
      const chatId = callbackQuery.message.chat.id;

      if (data.startsWith("lead_progress_") || data.startsWith("lead_reject_")) {
        const isProgress = data.startsWith("lead_progress_");
        const leadId = data.replace(isProgress ? "lead_progress_" : "lead_reject_", "");
        const newStatus = isProgress ? "IN_PROGRESS" : "REJECTED";

        const telegramUserId = callbackQuery.from?.id ? String(callbackQuery.from.id) : null;
        let userName = callbackQuery.from?.first_name || "Менеджер";

        let updateData: any = { status: newStatus };

        // Connect User if found by telegramId
        if (isProgress && telegramUserId) {
          const user = await prisma.user.findUnique({ where: { telegramId: telegramUserId } });
          if (user) {
            updateData.assignedUsers = { connect: { id: user.id } };
            userName = user.name; // Use DB name
          }
        }

        // Update lead in DB
        await prisma.lead.update({
          where: { id: leadId },
          data: updateData,
        });

        // Edit the message in Telegram to remove buttons and show updated status
        const originalText = callbackQuery.message.text;
        const statusText = isProgress ? `✅ Взято в роботу менеджером: ${userName}` : `❌ Відхилено (${userName})`;
        const newText = `${originalText}\n\n${statusText}`;

        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: newText,
            }),
          });
        }
        
        return NextResponse.json({ ok: true });
      }

      // Handle Reminders
      if (data.startsWith("remind_")) {
        const telegramUserId = callbackQuery.from?.id ? String(callbackQuery.from.id) : null;
        if (!telegramUserId) return NextResponse.json({ ok: true });

        const user = await prisma.user.findUnique({ where: { telegramId: telegramUserId } });
        if (!user) return NextResponse.json({ ok: true });

        if (data.startsWith("remind_cancel_")) {
          const leadId = data.replace("remind_cancel_", "");
          await prisma.lead.update({
            where: { id: leadId },
            data: { nextContactDate: null }
          });
          
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                text: `${callbackQuery.message.text}\n\n✅ Нагадування скасовано.`,
              }),
            });
          }
        } 
        else if (data.startsWith("remind_postpone_")) {
          const leadId = data.replace("remind_postpone_", "");
          
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageReplyMarkup`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "⏳ +15 хв", callback_data: `remind_add_15m_${leadId}` },
                      { text: "⏳ +1 год", callback_data: `remind_add_1h_${leadId}` },
                      { text: "📅 Завтра", callback_data: `remind_add_1d_${leadId}` }
                    ],
                    [
                      { text: "❌ Скасувати нагадування", callback_data: `remind_cancel_${leadId}` }
                    ]
                  ]
                }
              }),
            });
          }
        }
        else if (data.startsWith("remind_add_")) {
          const parts = data.replace("remind_add_", "").split("_");
          const amount = parts[0]; // "15m", "1h", "1d"
          const leadId = parts[1];
          
          const lead = await prisma.lead.findUnique({ where: { id: leadId } });
          if (lead) {
            let newDate = new Date();
            if (lead.nextContactDate && lead.nextContactDate > newDate) {
              newDate = new Date(lead.nextContactDate);
            }
            
            if (amount === "15m") newDate.setMinutes(newDate.getMinutes() + 15);
            if (amount === "1h") newDate.setHours(newDate.getHours() + 1);
            if (amount === "1d") newDate.setDate(newDate.getDate() + 1);
            
            await prisma.lead.update({
              where: { id: leadId },
              data: { nextContactDate: newDate }
            });
            
            const timeStr = newDate.toLocaleString("uk-UA", { timeZone: "Europe/Kiev" });
            
            if (botToken) {
              await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  message_id: messageId,
                  text: `${callbackQuery.message.text}\n\n✅ Перенесено на: ${timeStr}`,
                }),
              });
            }
          }
        }
        
        return NextResponse.json({ ok: true });
      }
    }

    // Acknowledge other updates
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

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
    }

    // Acknowledge other updates
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}

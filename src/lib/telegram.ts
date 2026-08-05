export async function sendTelegramMessage(text: string, reply_markup?: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("--- TELEGRAM NOTIFICATION (MOCK/CONSOLE LOG) ---");
    console.log(text);
    console.log("------------------------------------------------");
    return { success: true, mode: "mock" };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
        ...(reply_markup && { reply_markup })
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.description || "Failed to send message to Telegram");
    }

    return { success: true, mode: "api", data };
  } catch (error: any) {
    console.error("Telegram Notification Error:", error.message);
    return { success: false, error: error.message };
  }
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  let botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (botToken) {
    botToken = botToken.replace(/["']/g, "").trim();
  }
  
  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 400 });
  }

  // Use the host of the incoming request to set the webhook
  // On Vercel, this will be your actual production domain
  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/bot/webhook`;

  try {
    const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`;
    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json({ 
      success: true, 
      webhookUrl,
      telegramResponse: data 
    });
  } catch (error) {
    console.error("Setup webhook error:", error);
    return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 });
  }
}

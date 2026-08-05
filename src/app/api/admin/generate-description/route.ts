import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { make, model, year, mileage, engine, transmission, body } = await request.json();

    // In a real application, we would call OpenAI API here:
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: `Write a sales description for...` }],
    // });
    
    // For now, we return a beautifully mocked AI response
    // Delay slightly to simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockResponse = `🔥 ПРОДАЖ ЕКСКЛЮЗИВНОГО АВТОМОБІЛЯ! 🔥

Представляємо вашій увазі шикарний **${make || 'автомобіль'} ${model || ''}** ${year ? `${year} року випуску` : ''}! 
Цей ${body || 'автомобіль'} створений для тих, хто цінує комфорт, динаміку та статус.

💪 **Головні переваги:**
• Надійний двигун: ${engine || 'в ідеальному стані'}
• Трансмісія: ${transmission || 'працює без нарікань'}
• Пробіг: всього ${(mileage / 1000).toFixed(0)} тис. км — машина пройшла повну обкатку та готова до будь-яких випробувань!

✨ **Чому саме цей автомобіль?**
Машина знаходилась у дбайливому користуванні. Кузов в ідеальному стані, без подряпин та вм'ятин. Салон пахне новим автомобілем, жодних потертостей. Повністю обслужена та не потребує ЖОДНИХ вкладень! Сів і поїхав!

Приїжджайте на тест-драйв, і ви закохаєтесь у неї з перших секунд за кермом!
Можливий обмін (Trade-In) та продаж у лізинг на найвигідніших умовах.`;

    return NextResponse.json({ description: mockResponse });
  } catch (error) {
    console.error("AI Generation error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}

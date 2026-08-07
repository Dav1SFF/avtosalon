import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // Option: Verify Vercel Cron Secret here if needed.
  // const authHeader = req.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  try {
    const today = new Date();
    const currentDay = today.getDate();
    const isFirstOfMonth = currentDay === 1;

    let processedCount = 0;

    // 1. Process Recurring Expenses that fall on today's date
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        dayOfMonth: currentDay,
      }
    });

    for (const rec of recurringExpenses) {
      await prisma.globalExpense.create({
        data: {
          category: rec.category,
          amount: rec.amount,
          date: today,
          note: rec.note || "Автоматичне списання",
        }
      });
      processedCount++;
    }

    // 2. Process Manager Salaries if it's the 1st of the month
    if (isFirstOfMonth) {
      const managersWithSalary = await prisma.user.findMany({
        where: {
          salary: { gt: 0 }
        }
      });

      for (const manager of managersWithSalary) {
        await prisma.globalExpense.create({
          data: {
            category: "Зарплати",
            amount: manager.salary,
            date: today,
            note: `Зарплата: ${manager.name} (Автоматично)`,
          }
        });
        processedCount++;
      }
    }

    return NextResponse.json({ success: true, processedCount, currentDay, isFirstOfMonth });
  } catch (error) {
    console.error("Cron Job Error", error);
    return NextResponse.json({ error: "Failed to run cron" }, { status: 500 });
  }
}

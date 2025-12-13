import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

import { z } from "zod";

const customReportSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validation = customReportSchema.safeParse(body);

    if (!validation.success) return errorResponse("Invalid date range", 400);

    const { startDate: startStr, endDate: endStr } = validation.data;
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    });

    const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expense;

    const categoryTotals = new Map<string, { name: string; income: number; expense: number }>();
    transactions.forEach((t) => {
      const key = t.categoryId;
      const current = categoryTotals.get(key) || { name: t.category.name, income: 0, expense: 0 };

      if (t.type === "INCOME") {
        current.income += Number(t.amount);
      } else {
        current.expense += Number(t.amount);
      }

      categoryTotals.set(key, current);
    });

    const categoryBreakdown = Array.from(categoryTotals.values()).sort((a, b) => b.expense - a.expense);

    const accountTotals = new Map<string, { name: string; type: string; income: number; expense: number }>();
    transactions.forEach((t) => {
      const key = t.accountId;
      const current = accountTotals.get(key) || {
        name: t.account.name,
        type: t.account.type,
        income: 0,
        expense: 0,
      };

      if (t.type === "INCOME") {
        current.income += Number(t.amount);
      } else {
        current.expense += Number(t.amount);
      }

      accountTotals.set(key, current);
    });

    const accountBreakdown = Array.from(accountTotals.values());

    const dailyTotals = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const dateKey = t.date.toISOString().split("T")[0];
      const current = dailyTotals.get(dateKey) || { income: 0, expense: 0 };

      if (t.type === "INCOME") {
        current.income += Number(t.amount);
      } else {
        current.expense += Number(t.amount);
      }

      dailyTotals.set(dateKey, current);
    });

    const dailyTrend = Array.from(dailyTotals.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return successResponse({
      dateRange: { startDate: startStr, endDate: endStr },
      summary: {
        income,
        expense,
        balance,
        transactionCount: transactions.length,
        avgDailyExpense: expense / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)),
      },
      categoryBreakdown,
      accountBreakdown,
      dailyTrend,
      transactions,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

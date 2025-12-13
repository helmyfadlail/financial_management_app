import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

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
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    const daysInMonth = endDate.getDate();
    const avgDailyExpense = expense > 0 ? expense / daysInMonth : 0;

    const largestTransaction = transactions.length > 0 ? Math.max(...transactions.map((t) => Number(t.amount))) : 0;

    const categoryTotals = new Map<string, { name: string; total: number }>();

    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const current = categoryTotals.get(t.categoryId) || { name: t.category.name, total: 0 };
        categoryTotals.set(t.categoryId, {
          name: t.category.name,
          total: current.total + Number(t.amount),
        });
      });

    const topCategories = Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const dailySpending = new Map<string, number>();

    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const dateKey = t.date.toISOString().split("T")[0];
        dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + Number(t.amount));
      });

    const spendingTrend = Array.from(dailySpending.entries()).map(([date, amount]) => ({ date, amount }));

    return successResponse({
      summary: {
        income,
        expense,
        balance,
        avgDailyExpense,
        savingsRate,
        largestTransaction,
        transactionCount: transactions.length,
      },
      topCategories,
      spendingTrend,
      transactions,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

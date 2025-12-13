import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const monthlyBreakdown = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const monthTransactions = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);

      const income = monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyBreakdown.push({
        month: monthStart.toLocaleString("id-ID", { month: "short" }),
        income,
        expense,
        balance: income - expense,
      });
    }

    const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + Number(t.amount), 0);

    const yearlyBalance = totalIncome - totalExpense;
    const avgMonthlyIncome = totalIncome / 12;
    const avgMonthlyExpense = totalExpense / 12;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const categoryTotals = new Map<string, { name: string; total: number }>();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const key = t.categoryId;
        const current = categoryTotals.get(key) || { name: t.category.name, total: 0 };
        categoryTotals.set(key, {
          name: t.category.name,
          total: current.total + Number(t.amount),
        });
      });

    const topCategories = Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return successResponse({
      summary: {
        totalIncome,
        totalExpense,
        yearlyBalance,
        avgMonthlyIncome,
        avgMonthlyExpense,
        savingsRate,
        transactionCount: transactions.length,
      },
      monthlyBreakdown,
      topCategories,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

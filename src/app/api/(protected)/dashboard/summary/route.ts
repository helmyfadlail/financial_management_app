import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function GET() {
  try {
    const user = await requireAuth();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0);

    const [currentIncome, currentExpense, prevIncome, prevExpense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: "INCOME",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: "INCOME",
          date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          type: "EXPENSE",
          date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    const currentIncomeTotal = Number(currentIncome._sum.amount || 0);
    const currentExpenseTotal = Number(currentExpense._sum.amount || 0);
    const prevIncomeTotal = Number(prevIncome._sum.amount || 0);
    const prevExpenseTotal = Number(prevExpense._sum.amount || 0);

    const currentBalance = currentIncomeTotal - currentExpenseTotal;
    const prevBalance = prevIncomeTotal - prevExpenseTotal;

    const incomeChange = prevIncomeTotal > 0 ? ((currentIncomeTotal - prevIncomeTotal) / prevIncomeTotal) * 100 : 0;
    const expenseChange = prevExpenseTotal > 0 ? ((currentExpenseTotal - prevExpenseTotal) / prevExpenseTotal) * 100 : 0;
    const balanceChange = prevBalance !== 0 ? ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100 : 0;

    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, account: true },
      orderBy: { date: "desc" },
      take: 5,
    });

    const accounts = await prisma.account.findMany({ where: { userId: user.id } });

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    return successResponse({
      currentMonth: {
        income: currentIncomeTotal,
        expense: currentExpenseTotal,
        balance: currentBalance,
      },
      previousMonth: {
        income: prevIncomeTotal,
        expense: prevExpenseTotal,
        balance: prevBalance,
      },
      changes: {
        income: incomeChange,
        expense: expenseChange,
        balance: balanceChange,
      },
      totalBalance,
      recentTransactions,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

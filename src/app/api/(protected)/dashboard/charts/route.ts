import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function GET() {
  try {
    const user = await requireAuth();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const [income, expense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId: user.id,
            type: "INCOME",
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: user.id,
            type: "EXPENSE",
            date: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        }),
      ]);

      monthlyData.push({
        month: date.toLocaleString("id-ID", { month: "short", year: "numeric" }),
        income: Number(income._sum.amount || 0),
        expense: Number(expense._sum.amount || 0),
      });
    }

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const expensesByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    const categoryData = await Promise.all(
      expensesByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          name: category?.name || "Unknown",
          value: Number(item._sum.amount || 0),
          color: category?.color || "#gray",
        };
      })
    );

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: currentMonth + 1,
        year: currentYear,
      },
      include: { category: true },
    });

    const budgetProgress = budgets.map((budget) => ({
      category: budget.category.name,
      budget: Number(budget.amount),
      spent: Number(budget.spent),
      percentage: (Number(budget.spent) / Number(budget.amount)) * 100,
    }));

    return successResponse({
      monthlyData,
      categoryData,
      budgetProgress,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

import { prisma } from "@/lib";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export const applyBalanceChange = async (
  tx: TxClient,
  transaction: {
    type: string;
    accountId: string;
    toAccountId?: string | null;
    amount: { toNumber(): number } | number;
  },
  direction: "apply" | "reverse",
) => {
  const amount = typeof transaction.amount === "number" ? transaction.amount : transaction.amount.toNumber();

  const multiplier = direction === "reverse" ? -1 : 1;

  if (transaction.type === "TRANSFER") {
    // source: deduct
    await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { increment: -amount * multiplier } } });
    // destination: credit (optional)
    if (transaction.toAccountId) {
      await tx.account.update({ where: { id: transaction.toAccountId }, data: { balance: { increment: amount * multiplier } } });
    }
  } else {
    const change = transaction.type === "INCOME" ? amount : -amount;
    await tx.account.update({ where: { id: transaction.accountId }, data: { balance: { increment: change * multiplier } } });
  }
};

export const applyBudgetChange = async (
  tx: TxClient,
  userId: string,
  transaction: {
    type: string;
    categoryId?: string | null;
    amount: { toNumber(): number } | number;
    date: Date | string;
  },
  direction: "apply" | "reverse",
) => {
  if (transaction.type !== "EXPENSE" || !transaction.categoryId) return;

  const amount = typeof transaction.amount === "number" ? transaction.amount : transaction.amount.toNumber();

  const date = new Date(transaction.date);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  await tx.budget.updateMany({
    where: { userId, categoryId: transaction.categoryId, month, year },
    data: { spent: direction === "apply" ? { increment: amount } : { decrement: amount } },
  });
};

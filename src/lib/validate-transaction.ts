import { prisma } from "@/lib";

export const TRANSACTION_INCLUDE = {
  category: true,
  account: true,
  toAccount: true,
} as const;

export const validateAccount = async (userId: string, accountId: string, toAccountId?: string) => {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) return { error: "Source account not found" };

  if (toAccountId) {
    const toAccount = await prisma.account.findFirst({ where: { id: toAccountId, userId } });
    if (!toAccount) return { error: "Destination account not found" };
  }

  return { error: null };
};

export const validateCategory = async (userId: string, categoryId?: string) => {
  if (!categoryId) return { error: null };
  const category = await prisma.category.findFirst({ where: { id: categoryId, OR: [{ userId }, { isDefault: true }] } });
  if (!category) return { error: "Category not found" };
  return { error: null };
};

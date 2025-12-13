import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import z from "zod";

import { updateTransactionSchema } from "@/types";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
      include: { category: true, account: true },
    });

    if (!transaction) return errorResponse("Transaction not found", 404);

    return successResponse(transaction);
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const body = await req.json();
    const validation = updateTransactionSchema.safeParse(body);

    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const existing = await prisma.transaction.findFirst({ where: { id, userId: user.id } });

    if (!existing) return errorResponse("Transaction not found", 404);

    const data = validation.data;

    const transaction = await prisma.$transaction(async (tx) => {
      const oldBalanceChange = existing.type === "INCOME" ? -existing.amount : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { balance: { increment: oldBalanceChange } },
      });

      if (existing.type === "EXPENSE") {
        const oldDate = new Date(existing.date);
        await tx.budget.updateMany({
          where: {
            userId: user.id,
            categoryId: existing.categoryId,
            month: oldDate.getMonth() + 1,
            year: oldDate.getFullYear(),
          },
          data: { spent: { decrement: existing.amount } },
        });
      }

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...data,
          ...(data.date && { date: new Date(data.date) }),
        },
        include: { category: true, account: true },
      });

      const newBalanceChange = updated.type === "INCOME" ? updated.amount : -updated.amount;
      await tx.account.update({
        where: { id: updated.accountId },
        data: { balance: { increment: newBalanceChange } },
      });

      if (updated.type === "EXPENSE") {
        const newDate = new Date(updated.date);
        await tx.budget.updateMany({
          where: {
            userId: user.id,
            categoryId: updated.categoryId,
            month: newDate.getMonth() + 1,
            year: newDate.getFullYear(),
          },
          data: { spent: { increment: updated.amount } },
        });
      }

      return updated;
    });

    return successResponse(transaction, "Transaction updated successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({ where: { id, userId: user.id } });

    if (!transaction) return errorResponse("Transaction not found", 404);

    await prisma.$transaction(async (tx) => {
      const balanceChange = transaction.type === "INCOME" ? -transaction.amount : transaction.amount;
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: balanceChange } },
      });

      if (transaction.type === "EXPENSE") {
        const date = new Date(transaction.date);
        await tx.budget.updateMany({
          where: {
            userId: user.id,
            categoryId: transaction.categoryId,
            month: date.getMonth() + 1,
            year: date.getFullYear(),
          },
          data: { spent: { decrement: transaction.amount } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    return successResponse(null, "Transaction deleted successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

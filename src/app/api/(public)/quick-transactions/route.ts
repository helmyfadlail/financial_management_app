import { NextRequest } from "next/server";

import { prisma } from "@/lib";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import z from "zod";

import { quickTransactionSchema } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const quickTransactions = await prisma.user.findUnique({
      where: { email: email as string },
      select: {
        email: true,
        name: true,
        categories: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
            isDefault: true,
          },
        },
        accounts: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
            isDefault: true,
          },
        },
      },
    });

    if (!quickTransactions) return errorResponse("Email not found. Please enter correct email!", 404);

    return successResponse(quickTransactions);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = quickTransactionSchema.safeParse(body);

    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const { email, ...data } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return errorResponse("User not found. Please create an account first", 404);

    const quickTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: data.accountId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: new Date(data.date),
        attachment: data.attachment,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return successResponse(quickTransaction, "Quick transaction created successfully");
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

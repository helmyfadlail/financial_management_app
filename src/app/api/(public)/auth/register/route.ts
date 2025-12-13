import { NextRequest } from "next/server";

import { prisma } from "@/lib";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import { registerSchema } from "@/types";

import z from "zod";

import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const { email, password, name } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) return errorResponse("Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, name, emailVerified: new Date() },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.category.createMany({
        data: [
          { userId: user.id, name: "Salary", type: "INCOME", icon: "💰", color: "#10B981", isDefault: true },
          { userId: user.id, name: "Bonus", type: "INCOME", icon: "🎁", color: "#3B82F6", isDefault: true },
          { userId: user.id, name: "Investment", type: "INCOME", icon: "📈", color: "#8B5CF6", isDefault: true },
          { userId: user.id, name: "Freelance", type: "INCOME", icon: "💼", color: "#F59E0B", isDefault: true },

          { userId: user.id, name: "Food & Drinks", type: "EXPENSE", icon: "🍔", color: "#EF4444", isDefault: true },
          { userId: user.id, name: "Transportation", type: "EXPENSE", icon: "🚗", color: "#F59E0B", isDefault: true },
          { userId: user.id, name: "Shopping", type: "EXPENSE", icon: "🛒", color: "#8B5CF6", isDefault: true },
          { userId: user.id, name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#EC4899", isDefault: true },
          { userId: user.id, name: "Bills", type: "EXPENSE", icon: "📄", color: "#6366F1", isDefault: true },
          { userId: user.id, name: "Healthcare", type: "EXPENSE", icon: "⚕️", color: "#14B8A6", isDefault: true },
          { userId: user.id, name: "Education", type: "EXPENSE", icon: "📚", color: "#06B6D4", isDefault: true },
        ],
      });

      await tx.account.create({
        data: {
          userId: user.id,
          name: "Cash",
          type: "CASH",
          balance: 0,
          isDefault: true,
          color: "#10B981",
          icon: "💵",
        },
      });

      return user;
    });

    return successResponse(result, "Registration successful");
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

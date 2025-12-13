import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import z from "zod";

import { categorySchema } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: user.id }],
        ...(type && { type: type as "INCOME" | "EXPENSE" }),
      },
      orderBy: { name: "asc" },
    });

    return successResponse(categories);
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validation = categorySchema.safeParse(body);

    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const category = await prisma.category.create({ data: { userId: user.id, ...validation.data } });

    return successResponse(category, "Category created successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

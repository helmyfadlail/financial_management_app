import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import { z } from "zod";

import { updateProfileSchema } from "@/types";

export async function GET() {
  try {
    const user = await requireAuth();

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) return errorResponse("User not found", 404);

    return successResponse(userData);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    console.log(error);
    return errorResponse(error as string, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const { name, avatar } = validation.data;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser, "Profile updated successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

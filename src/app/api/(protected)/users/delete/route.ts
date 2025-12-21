import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function DELETE() {
  try {
    const user = await requireAuth();

    await prisma.user.delete({ where: { id: user.id } });

    return successResponse(null, "Account deleted successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function DELETE() {
  try {
    const user = await requireAuth();

    // Delete user and all related data (cascading)
    // Prisma will handle cascading deletes based on your schema relations
    await prisma.user.delete({ where: { id: user.id } });

    // Clear session/token
    // This depends on your auth implementation
    // For next-auth, you might need to signOut() or invalidate the session

    return successResponse(null, "Account deleted successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

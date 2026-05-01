import { prisma, requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) return errorResponse("Unauthorized", 401);

    const settings = await prisma.appSetting.findMany({
      where: { isPublic: true },
      orderBy: [{ category: "asc" }, { key: "asc" }],
      select: {
        key: true,
        value: true,
        type: true,
        category: true,
        label: true,
        description: true,
      },
    });

    const parsed = settings.map((s) => ({ ...s, value: s.type === "json" ? JSON.parse(s.value) : s.value }));
    return successResponse(parsed);
  } catch (error) {
    console.error("[GET /settings]", error);
    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);
    return errorResponse("Failed to fetch app settings", 500);
  }
}

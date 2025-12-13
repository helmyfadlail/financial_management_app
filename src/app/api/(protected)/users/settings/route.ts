import { NextRequest } from "next/server";

import { prisma, requireAuth } from "@/lib";

import { Prisma } from "prisma-client/client";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import z from "zod";

import { bulkSettingsSchema, DEFAULT_SETTINGS } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || undefined;
    const key = searchParams.get("key") || undefined;

    const where: Prisma.UserSettingWhereInput = { userId: user.id };
    if (category) where.category = category;
    if (key) where.key = key;

    let settings = await prisma.userSetting.findMany({
      where,
      orderBy: [{ category: "asc" }, { key: "asc" }],
    });

    if (settings.length === 0 && !category && !key) {
      const defaultSettings = DEFAULT_SETTINGS.map((setting) => ({
        userId: user.id,
        ...setting,
      }));

      await prisma.userSetting.createMany({
        data: defaultSettings,
        skipDuplicates: true,
      });

      settings = await prisma.userSetting.findMany({
        where: { userId: user.id },
        orderBy: [{ category: "asc" }, { key: "asc" }],
      });
    }

    return successResponse(settings);
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

    const validation = bulkSettingsSchema.safeParse(body);
    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const settingsData = validation.data;

    const keys = settingsData.map((s) => s.key);

    await prisma.userSetting.deleteMany({ where: { userId: user.id, key: { in: keys } } });

    const result = await prisma.userSetting.createMany({
      data: settingsData.map((setting) => ({
        userId: user.id,
        key: setting.key,
        value: setting.value,
        icon: setting.icon,
        type: setting.type || "string",
        category: setting.category || "general",
        description: setting.description,
      })),
      skipDuplicates: true,
    });

    return successResponse(result, "Settings saved successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const category = searchParams.get("category");

    if (!key && !category) return errorResponse("Either 'key' or 'category' parameter is required", 400);

    const where: Prisma.UserSettingWhereInput = { userId: user.id };
    if (key) where.key = key;
    if (category) where.category = category;

    const result = await prisma.userSetting.deleteMany({ where });

    return successResponse({ deletedCount: result.count }, `${result.count} setting(s) deleted successfully`);
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

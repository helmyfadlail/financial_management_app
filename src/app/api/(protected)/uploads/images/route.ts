import { NextRequest, NextResponse } from "next/server";

import { writeFile, mkdir, unlink } from "fs/promises";

import { existsSync } from "fs";

import path from "path";

import { requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `avatar-${timestamp}-${randomString}${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, and WebP are allowed" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const fileName = generateFileName(file.name);
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/avatars/${fileName}`;

    return successResponse({
      success: true,
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    console.log(error);
    return errorResponse(error as string, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    if (!fileName.startsWith("avatar-")) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", "avatars", fileName);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return successResponse(true, "Avatar deleted successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

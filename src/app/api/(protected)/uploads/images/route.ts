import { NextRequest } from "next/server";

import ImageKit from "imagekit";

import { requireAuth } from "@/lib";

import { errorResponse, successResponse } from "@/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop() || "jpg";
  return `avatar-${timestamp}-${randomString}.${extension}`;
};

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return errorResponse("No file uploaded", 400);

    if (!ALLOWED_TYPES.includes(file.type)) return errorResponse("Invalid file type. Only JPG, PNG, and WebP are allowed", 400);

    if (file.size > MAX_FILE_SIZE) return errorResponse("File size exceeds 5MB limit", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = generateFileName(file.name);

    const result = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: "/avatars",
      useUniqueFileName: false,
      tags: ["avatar", "user-upload"],
    });

    return successResponse({
      success: true,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      fileName: result.name,
      filePath: result.filePath,
      size: result.size,
      type: file.type,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        return errorResponse("ImageKit authentication failed", 500);
      }
      return errorResponse(error.message, 500);
    }

    return errorResponse("Failed to upload avatar", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) return errorResponse("No filename provided", 400);

    if (!fileName.startsWith("avatar-")) return errorResponse("Invalid file", 400);

    const files = await imagekit.listFiles({ searchQuery: `name="${fileName}"`, path: "/avatars" });

    if (files.length === 0) return errorResponse("File not found", 404);

    const fileObject = files[0];
    if (!("fileId" in fileObject)) {
      return errorResponse("Invalid file object", 400);
    }

    await imagekit.deleteFile(fileObject.fileId);

    return successResponse(true, "Avatar deleted successfully");
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

    if (errorMessage.includes("not found")) return errorResponse("File not found or already deleted", 404);

    return errorResponse(errorMessage, 500);
  }
}

import { NextResponse } from "next/server";

import { errorResponse } from "@/utils";

export async function GET() {
  try {
    return NextResponse.json({ status: "healthy", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Service unavailable";
    return errorResponse(errorMessage, 503);
  }
}

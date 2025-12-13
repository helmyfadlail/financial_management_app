import { NextRequest } from "next/server";

import { prisma } from "@/lib";

import { errorResponse, successResponse, validationErrorResponse } from "@/utils";

import z from "zod";

import { forgotPasswordSchema } from "@/types";

import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      const { fieldErrors } = z.flattenError(validation.error);
      return validationErrorResponse(fieldErrors);
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return successResponse(null, "If the email exists, a reset link has been sent");

    if (!user.password) return errorResponse("This account is registered via Google. Please sign in with Google.", 400);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({ data: { identifier: email, token: hashedToken, expires } });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    // await sendEmail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   html: `Click here to reset password: ${resetUrl}`,
    // });

    console.log("Reset token:", resetToken); // For development only!
    console.log("Reset URL:", `http://localhost:3000/reset-password?token=${resetToken}`);

    return successResponse({ token: resetToken }, "If the email exists, a reset link has been sent");
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return errorResponse(errorMessage, 500);
  }
}

import { NextResponse } from "next/server";

export const successResponse = <T>(data: T, message = "Success") => {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (message: string, status = 400) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};

export const validationErrorResponse = <T>(errors: T) => {
  return NextResponse.json(
    {
      success: false,
      message: "Validation error",
      errors,
    },
    { status: 422 }
  );
};

import { Suspense } from "react";
import { ResetPasswordSuccess } from "@/layouts";

export default function ResetPasswordSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordSuccess />
    </Suspense>
  );
}

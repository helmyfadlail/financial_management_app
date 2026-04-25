"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components";

export const ResetPasswordSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const title = searchParams.get("title") || "Success!";
  const message = searchParams.get("message") || "Your action has been completed successfully.";
  const redirectUrl = searchParams.get("redirect") || "/admin/dashboard";
  const redirectLabel = searchParams.get("redirectLabel") || "Go to Dashboard";
  const autoRedirect = searchParams.get("autoRedirect") !== "false";

  const [countdown, setCountdown] = React.useState<number>(5);

  React.useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = redirectUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, redirectUrl, router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-linear-to-br from-primary via-secondary to-accent">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-accent opacity-20 blur-3xl" />
        <div className="absolute rounded-full bottom-20 right-10 w-96 h-96 bg-secondary opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-primary-900">{title}</h2>

            <p className="mt-3 text-primary-600">{message}</p>

            {autoRedirect && countdown > 0 && (
              <p className="mt-4 text-sm text-primary-500">
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
              </p>
            )}

            <div className="flex flex-col w-full gap-3 mt-8">
              <Link href={redirectUrl} className="w-full">
                <Button variant="primary" size="lg" className="w-full">
                  {redirectLabel}
                </Button>
              </Link>

              <Link href="/" className="w-full">
                <Button variant="outline" size="lg" className="w-full">
                  Go to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-center text-white/80">© 2025 Finance Manager. All rights reserved.</p>
      </div>
    </div>
  );
};

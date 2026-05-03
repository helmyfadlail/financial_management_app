"use client";

import * as React from "react";

import Link from "next/link";

import { useAuth } from "@/hooks";

import { Button, Input, useToast } from "@/components";

export const ForgotPassword = () => {
  const [email, setEmail] = React.useState<string>("");
  const [localError, setLocalError] = React.useState<string>("");

  const { addToast } = useToast();

  const { forgotPassword, isSendingForgotPassword, forgotPasswordError } = useAuth();

  const handleForgotPassword = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setLocalError("");

    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          addToast({ message: "Password reset link sent successfully.", type: "success" });
        },
        onError: (error: Error) => {
          addToast({ message: error.message || "Failed to send password reset link.", type: "error" });
        },
      },
    );
  };

  const error = localError || forgotPasswordError?.message;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-linear-to-br from-primary via-secondary to-accent">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-accent opacity-20 blur-3xl" />
        <div className="absolute rounded-full bottom-20 right-10 w-96 h-96 bg-secondary opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Forgot Password Card */}
        <div className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-900">Forgot your password?</h2>
            <p className="mt-1 text-primary-500">No worries! Enter your email address and we&apos;ll send you a link to reset your password.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 mb-6 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
              <svg className="size-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />

            <div className="pt-2 text-sm text-primary-600">
              <p>We&apos;ll send you an email with instructions to reset your password. The link will be valid for 1 hour.</p>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSendingForgotPassword}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-sm text-center text-primary-600">
            <Link href="/login" className="flex items-center justify-center gap-2 font-semibold text-primary-700 hover:text-primary-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-center text-white/80">© 2025 Finance Manager. All rights reserved.</p>
      </div>
    </div>
  );
};

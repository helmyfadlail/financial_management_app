"use client";

import * as React from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/hooks";

import { Button, Input } from "@/components";

export const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();

  const [password, setPassword] = React.useState<string>("");
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");
  const [localError, setLocalError] = React.useState<string>("");

  const handleResetPassword = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setLocalError("");

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setLocalError("Invalid or missing reset token");
      return;
    }

    resetPassword({ password, token });
  };

  const error = localError || resetPasswordError?.message;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-linear-to-br from-primary via-secondary to-accent">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full top-20 left-10 w-72 h-72 bg-accent opacity-20 blur-3xl" />
        <div className="absolute rounded-full bottom-20 right-10 w-96 h-96 bg-secondary opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-900">Reset your password</h2>
            <p className="mt-1 text-primary-500">Enter your new password below</p>
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

          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <div className="pt-2 text-sm text-primary-600">
              <p className="font-medium">Password requirements:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-primary-500">
                <li>At least 8 characters long</li>
                <li>Must match confirmation</li>
              </ul>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isResettingPassword}>
              Reset Password
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-primary-600">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-900">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-sm text-center text-white/80">© 2025 Finance Manager. All rights reserved.</p>
      </div>
    </div>
  );
};

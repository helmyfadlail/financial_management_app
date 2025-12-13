"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, RefreshCcw, Mail } from "lucide-react";

const errorMessages = {
  Callback: {
    title: "Authentication Error",
    message: "Something went wrong during sign-in. This might be a temporary issue.",
    suggestion: "Please try signing in again.",
  },
  OAuthSignin: {
    title: "OAuth Sign-in Error",
    message: "Failed to start the sign-in process with the provider.",
    suggestion: "Please check your internet connection and try again.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    message: "Failed to complete the sign-in process.",
    suggestion: "Please try signing in again or contact support if the issue persists.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    message: "We couldn't create your account automatically.",
    suggestion: "Please try using email/password registration instead.",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    message: "Failed to create your account with this email.",
    suggestion: "The email might already be registered. Try signing in instead.",
  },
  CredentialsSignin: {
    title: "Invalid Credentials",
    message: "The email or password you entered is incorrect.",
    suggestion: "Please check your credentials and try again.",
  },
  SessionRequired: {
    title: "Session Required",
    message: "You need to be signed in to access this page.",
    suggestion: "Please sign in to continue.",
  },
  Default: {
    title: "Authentication Error",
    message: "An unexpected error occurred during authentication.",
    suggestion: "Please try again or contact support if the problem persists.",
  },
} as const;

export const Error = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorType = (searchParams.get("error") || "Default") as keyof typeof errorMessages;

  const error = errorMessages[errorType] || errorMessages.Default;

  const handleRetry = () => {
    router.push("/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">{error.title}</h1>
            <p className="text-gray-600">{error.message}</p>
          </div>

          {/* Suggestion Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">💡 {error.suggestion}</p>
          </div>

          {/* Error Details (for developers) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-mono">Error Code: {errorType}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>

            <button onClick={handleGoHome} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <a href="mailto:support@yourapp.com" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-gray-500 mt-6">Having trouble? Make sure cookies are enabled and you&apos;re using a supported browser.</p>
      </div>
    </div>
  );
};

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signIn, signOut } from "next-auth/react";

import { useRouter } from "next/navigation";

import { apiClient } from "@/utils";

import type { ApiResponse, User } from "@/types";

interface RegisterData {
  email: string;
  password: string;
  name: string;
  currency?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Registration to financial management app
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => apiClient.post<ApiResponse<User>, RegisterData>("/auth/register", data),
    onSuccess: async (_, variables) => {
      await signIn("credentials", {
        email: variables.email,
        password: variables.password,
        redirect: false,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/admin/dashboard");
    },
  });

  // Login to financial management app with Google
  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/admin/dashboard" });
  };

  // Logout to financial management app
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      });
      router.push("/login");
    },
  });

  return {
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    loginWithGoogle,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};

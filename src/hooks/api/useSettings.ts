"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { apiClient } from "@/utils";
import type { ApiResponse, UserSetting } from "@/types";

const BASE_CURRENCY = "IDR";

export const useSettings = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Get all user settings
  const { data, isLoading } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => apiClient.get<ApiResponse<UserSetting[]>>("/users/settings"),
    enabled: !!session?.user,
  });

  // Fetch exchange rates
  const { data: ratesData, isLoading: isLoadingRates } = useQuery({
    queryKey: ["exchange-rates", BASE_CURRENCY],
    queryFn: async () => {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`);

      if (!response.ok) throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);

      const data = await response.json();

      if (!data.rates || typeof data.rates !== "object") throw new Error("Invalid response format: missing rates data");

      return data.rates as Record<string, number>;
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update setting preferences or alert
  const updateNotificationMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean | string }) => apiClient.patch<ApiResponse<UserSetting>, { value: string }>(`/users/settings/${key}`, { value: String(value) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
    },
  });

  // Export all summary transaction in pdf
  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/users/export");
      if (!response.ok) throw new Error("Failed to export PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finarthax-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    },
  });

  // Delete user account
  const deleteAccountMutation = useMutation({
    mutationFn: () => apiClient.delete<ApiResponse<null>>("/users/delete"),
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  return {
    notifications: data?.data || null,
    isLoading,
    exchangeRates: ratesData || null,
    isLoadingRates,
    updateNotification: updateNotificationMutation.mutate,
    updateNotificationAsync: updateNotificationMutation.mutateAsync,
    isUpdatingNotification: updateNotificationMutation.isPending,
    exportData: exportDataMutation.mutate,
    exportDataAsync: exportDataMutation.mutateAsync,
    isExporting: exportDataMutation.isPending,
    exportError: exportDataMutation.error,
    deleteAccount: deleteAccountMutation.mutate,
    deleteAccountAsync: deleteAccountMutation.mutateAsync,
    isDeleting: deleteAccountMutation.isPending,
    deleteError: deleteAccountMutation.error,
  };
};

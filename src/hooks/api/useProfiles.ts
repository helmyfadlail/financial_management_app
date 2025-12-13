"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";

import { apiClient } from "@/utils";

import type { ApiResponse, User } from "@/types";

interface ProfileData {
  name: string;
  avatar: string | null;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useProfiles = () => {
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();

  // Get user profile
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => apiClient.get<ApiResponse<User>>("/users/profile"),
    enabled: !!session?.user,
  });

  // Update name or avatar user
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileData) => apiClient.put<ApiResponse<User>, ProfileData>("/users/profile", data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      if (response.data?.name) {
        await updateSession({ ...session, user: { ...session?.user, name: response.data.name } });
      }
    },
  });

  // Update or change password user
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordData) => apiClient.post<ApiResponse<null>, PasswordData>("/users/change-password", data),
  });

  // Upload avatar file
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload avatar");

      const data = await response.json();
      return data.data.url;
    },
  });

  // Delete avatar file
  const deleteAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string): Promise<void> => {
      if (!avatarUrl || !avatarUrl.startsWith("/uploads/")) return;

      const fileName = avatarUrl.split("/").pop();
      const response = await fetch(`/api/uploads/images?file=${fileName}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Failed to delete avatar");
    },
  });

  return {
    profile: data?.data || null,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    profileError: updateProfileMutation.error,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    passwordError: changePasswordMutation.error,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadAvatarError: uploadAvatarMutation.error,
    deleteAvatar: deleteAvatarMutation.mutateAsync,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    deleteAvatarError: deleteAvatarMutation.error,
  };
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib";

export const getCurrentUser = async () => {
  try {
    const session = await getServerSession(authOptions);
    return session?.user ?? null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const requireAuth = async () => {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const getUserId = async (): Promise<string> => {
  const user = await requireAuth();
  return user.id;
};

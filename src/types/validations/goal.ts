import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  currentAmount: z.number().min(0, "Current amount cannot be negative").default(0),
  deadline: z.string().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
});

export const updateGoalSchema = goalSchema.partial();

export const updateGoalProgressSchema = z.object({
  currentAmount: z.number().min(0, "Current amount cannot be negative"),
});

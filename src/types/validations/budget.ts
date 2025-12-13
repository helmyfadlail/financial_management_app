import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string("Category ID is not valid"),
  amount: z.number().positive("The amount must be greater than 0"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive("The amount must be greater than 0"),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

import { z } from "zod";

export const recurringSchema = z.object({
  accountId: z.string(),
  categoryId: z.string(),
  amount: z.number().positive(),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().optional().nullable(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  isActive: z.boolean().default(true),
});

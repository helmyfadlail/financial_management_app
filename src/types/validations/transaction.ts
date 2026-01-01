import { z } from "zod";

export const transactionSchema = z.object({
  accountId: z.string("Account ID is not valid"),
  categoryId: z.string("Category ID is not valid"),
  amount: z.number().positive("The amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().optional().nullable(),
  date: z.string().or(z.date()),
  attachment: z.string().optional().nullable(),
});

export const updateTransactionSchema = transactionSchema.partial();

export const quickTransactionSchema = z.object({
  email: z.email("Invalid email address"),
  accountId: z.string("Account ID is not valid"),
  categoryId: z.string("Category ID is not valid"),
  amount: z.number().positive("The amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().optional().nullable(),
  date: z.string().or(z.date()),
  attachment: z.string().optional().nullable(),
});

export const transactionFilterSchema = z.object({
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional().nullable(),
  accountId: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

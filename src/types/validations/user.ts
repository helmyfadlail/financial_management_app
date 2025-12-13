import z from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  avatar: z.string("Invalid avatar URL").optional(),
});

export const updateNotificationsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  transactionAlerts: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

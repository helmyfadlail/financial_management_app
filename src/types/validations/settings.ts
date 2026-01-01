import { z } from "zod";

export const SettingType = z.enum(["boolean", "string", "number", "object", "array"]);
export const SettingCategory = z.enum(["general", "notifications", "appearance", "security", "privacy", "billing"]);

export const DEFAULT_SETTINGS = [
  {
    key: "emailNotifications",
    value: "true",
    type: "boolean",
    category: "notifications",
    description: "Receive email notifications",
    icon: "📩",
  },
  {
    key: "budgetAlerts",
    value: "true",
    type: "boolean",
    category: "notifications",
    description: "Get alerts when approaching budget limits",
    icon: "💰",
  },
  {
    key: "weeklyReports",
    value: "true",
    type: "boolean",
    category: "notifications",
    description: "Receive weekly financial reports",
    icon: "📊",
  },
  {
    key: "transactionAlerts",
    value: "true",
    type: "boolean",
    category: "notifications",
    description: "Get notified of new transactions",
    icon: "🔔",
  },
  {
    key: "marketingEmails",
    value: "true",
    type: "boolean",
    category: "notifications",
    description: "Receive marketing and promotional emails",
    icon: "📢",
  },
  {
    key: "language",
    value: "en",
    type: "string",
    category: "general",
    description: "Interface language",
    icon: "🌐",
  },
  {
    key: "currency",
    value: "IDR",
    type: "string",
    category: "general",
    description: "Default currency for transactions",
    icon: "💰",
  },
  {
    key: "theme",
    value: "light",
    type: "string",
    category: "appearance",
    description: "Interface theme",
    icon: "🎨",
  },
] as const;

export const updateSettingValueSchema = z.object({
  value: z.string(),
});

export const bulkSettingsSchema = z.array(
  z.object({
    key: z.string().min(1).max(100),
    value: z.string(),
    icon: z.string(),
    type: SettingType.optional().default("string"),
    category: SettingCategory.optional().default("general"),
    description: z.string().optional().nullable(),
  })
);

import { z } from "zod";

export const SettingType = z.enum(["boolean", "string", "number", "object", "array"]);
export const SettingCategory = z.enum(["general", "notifications", "appearance", "security", "privacy", "billing"]);

export const updateSettingValueSchema = z.object({ value: z.string() });

export const bulkSettingsSchema = z.array(
  z.object({
    key: z.string().min(1).max(100),
    value: z.string(),
    icon: z.string(),
    type: SettingType.optional().default("string"),
    category: SettingCategory.optional().default("general"),
    description: z.string().optional().nullable(),
  }),
);

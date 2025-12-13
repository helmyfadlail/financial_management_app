import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Color must be in hex format")
    .optional(),
  isDefault: z.boolean().default(false),
});

export const updateCategorySchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;

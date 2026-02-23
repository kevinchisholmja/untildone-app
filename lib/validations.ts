import { z } from "zod";

export const createReminderSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional()
    .or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  first_reminder_at: z.string().min(1, "First reminder date is required"),
  repeat_interval_days: z
    .number()
    .int()
    .min(1, "Interval must be at least 1 day")
    .max(365, "Interval must be under 365 days"),
  delivery_mode: z.enum(["aggressive", "balanced", "gentle"]),
});

export const updateReminderSchema = createReminderSchema.partial();

export const updateUserTierSchema = z.object({
  user_id: z.string().uuid(),
  subscription_tier: z.enum(["free", "starter", "pro"]),
  email_quota_monthly: z.number().int().min(0).optional(),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type UpdateUserTierInput = z.infer<typeof updateUserTierSchema>;

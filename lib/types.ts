export type Role = "user" | "admin" | "super_admin";
export type SubscriptionTier = "free" | "starter" | "pro";
export type DeliveryMode = "aggressive" | "balanced" | "gentle";
export type ReminderStatus =
  | "active"
  | "completed"
  | "paused_quota"
  | "paused_user";

export interface AppUser {
  id: string;
  email: string;
  role: Role;
  subscription_tier: SubscriptionTier;
  email_quota_monthly: number;
  email_quota_used: number;
  quota_reset_at: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  first_reminder_at: string;
  repeat_interval_days: number;
  current_interval_days: number;
  delivery_mode: DeliveryMode;
  last_sent_at: string | null;
  next_send_at: string;
  emails_sent_count: number;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
}

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  free: 100,
  starter: 1000,
  pro: 10000,
};

export const TIER_RATE_LIMITS: Record<
  SubscriptionTier,
  { max: number; windowMinutes: number }
> = {
  free: { max: 10, windowMinutes: 20 },
  starter: { max: 20, windowMinutes: 10 },
  pro: { max: 50, windowMinutes: 10 },
};

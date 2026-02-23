"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createReminderSchema } from "@/lib/validations";
import { useSWRConfig } from "swr";
import type { SubscriptionTier } from "@/lib/types";

export function CreateReminderDialog({
  userId,
  tier,
  onClose,
}: {
  userId: string;
  tier: SubscriptionTier;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { mutate } = useSWRConfig();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      due_date: (formData.get("due_date") as string) || "",
      first_reminder_at: formData.get("first_reminder_at") as string,
      repeat_interval_days: Number(formData.get("repeat_interval_days")),
      delivery_mode: formData.get("delivery_mode") as
        | "aggressive"
        | "balanced"
        | "gentle",
    };

    const parsed = createReminderSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    // Rate limit check
    const res = await fetch("/api/reminders/rate-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, tier }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Rate limit exceeded. Please wait.");
      setLoading(false);
      return;
    }

    const firstReminderAt = new Date(parsed.data.first_reminder_at);

    const { error } = await supabase.from("reminders").insert({
      user_id: userId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.due_date
        ? new Date(parsed.data.due_date).toISOString()
        : null,
      first_reminder_at: firstReminderAt.toISOString(),
      repeat_interval_days: parsed.data.repeat_interval_days,
      current_interval_days: parsed.data.repeat_interval_days,
      delivery_mode: parsed.data.delivery_mode,
      next_send_at: firstReminderAt.toISOString(),
      status: "active",
    });

    if (error) {
      toast.error("Failed to create reminder");
      setLoading(false);
      return;
    }

    toast.success("Reminder created");
    mutate(`reminders-${userId}`);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            New Reminder
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-foreground"
            >
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={200}
              placeholder="e.g., File tax return"
              className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              maxLength={1000}
              placeholder="Optional details..."
              className="rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="due_date"
                className="text-sm font-medium text-foreground"
              >
                Due Date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="first_reminder_at"
                className="text-sm font-medium text-foreground"
              >
                First Reminder *
              </label>
              <input
                id="first_reminder_at"
                name="first_reminder_at"
                type="datetime-local"
                required
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="repeat_interval_days"
                className="text-sm font-medium text-foreground"
              >
                Repeat Every (days) *
              </label>
              <input
                id="repeat_interval_days"
                name="repeat_interval_days"
                type="number"
                min={1}
                max={365}
                defaultValue={1}
                required
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="delivery_mode"
                className="text-sm font-medium text-foreground"
              >
                Delivery Mode *
              </label>
              <select
                id="delivery_mode"
                name="delivery_mode"
                defaultValue="balanced"
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="aggressive">Aggressive</option>
                <option value="balanced">Balanced</option>
                <option value="gentle">Gentle</option>
              </select>
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

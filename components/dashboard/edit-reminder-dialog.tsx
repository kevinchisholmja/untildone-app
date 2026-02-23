"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";
import { updateReminderSchema } from "@/lib/validations";
import type { Reminder } from "@/lib/types";
import { format } from "date-fns";

export function EditReminderDialog({
  reminder,
  onClose,
  onSaved,
}: {
  reminder: Reminder;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function formatDateForInput(dateStr: string | null) {
    if (!dateStr) return "";
    return format(new Date(dateStr), "yyyy-MM-dd");
  }

  function formatDateTimeForInput(dateStr: string) {
    return format(new Date(dateStr), "yyyy-MM-dd'T'HH:mm");
  }

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

    const parsed = updateReminderSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const updates: Record<string, unknown> = {
      title: parsed.data.title,
      description: parsed.data.description || null,
      delivery_mode: parsed.data.delivery_mode,
    };

    if (parsed.data.due_date) {
      updates.due_date = new Date(parsed.data.due_date).toISOString();
    }
    if (parsed.data.first_reminder_at) {
      updates.first_reminder_at = new Date(
        parsed.data.first_reminder_at
      ).toISOString();
    }
    if (parsed.data.repeat_interval_days) {
      updates.repeat_interval_days = parsed.data.repeat_interval_days;
      updates.current_interval_days = parsed.data.repeat_interval_days;
    }

    const { error } = await supabase
      .from("reminders")
      .update(updates)
      .eq("id", reminder.id);

    if (error) {
      toast.error("Failed to update reminder");
      setLoading(false);
      return;
    }

    toast.success("Reminder updated");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Edit Reminder
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
              htmlFor="edit-title"
              className="text-sm font-medium text-foreground"
            >
              Title *
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              maxLength={200}
              defaultValue={reminder.title}
              className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="edit-description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={2}
              maxLength={1000}
              defaultValue={reminder.description ?? ""}
              className="rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-due_date"
                className="text-sm font-medium text-foreground"
              >
                Due Date
              </label>
              <input
                id="edit-due_date"
                name="due_date"
                type="date"
                defaultValue={formatDateForInput(reminder.due_date)}
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-first_reminder_at"
                className="text-sm font-medium text-foreground"
              >
                First Reminder *
              </label>
              <input
                id="edit-first_reminder_at"
                name="first_reminder_at"
                type="datetime-local"
                required
                defaultValue={formatDateTimeForInput(
                  reminder.first_reminder_at
                )}
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-repeat_interval_days"
                className="text-sm font-medium text-foreground"
              >
                Repeat Every (days) *
              </label>
              <input
                id="edit-repeat_interval_days"
                name="repeat_interval_days"
                type="number"
                min={1}
                max={365}
                defaultValue={reminder.repeat_interval_days}
                required
                className="h-11 rounded-lg border border-input bg-background px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-delivery_mode"
                className="text-sm font-medium text-foreground"
              >
                Delivery Mode *
              </label>
              <select
                id="edit-delivery_mode"
                name="delivery_mode"
                defaultValue={reminder.delivery_mode}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

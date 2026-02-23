"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CheckCircle2,
  Pause,
  Play,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import type { Reminder } from "@/lib/types";
import { EditReminderDialog } from "./edit-reminder-dialog";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    className: "bg-primary/10 text-primary",
    icon: <Clock className="h-3 w-3" />,
  },
  completed: {
    label: "Completed",
    className: "bg-chart-2/20 text-chart-2",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  paused_quota: {
    label: "Paused - Quota",
    className: "bg-chart-5/20 text-chart-5",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  paused_user: {
    label: "Paused",
    className: "bg-muted text-muted-foreground",
    icon: <Pause className="h-3 w-3" />,
  },
};

async function fetchReminders(userId: string): Promise<Reminder[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function ReminderList({
  initialReminders,
  userId,
}: {
  initialReminders: Reminder[];
  userId: string;
}) {
  const { data: reminders, mutate } = useSWR(
    `reminders-${userId}`,
    () => fetchReminders(userId),
    { fallbackData: initialReminders, revalidateOnFocus: true }
  );

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const supabase = createClient();

  async function handleComplete(id: string) {
    setActionLoading(id);
    const { error } = await supabase
      .from("reminders")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to complete reminder");
    } else {
      toast.success("Reminder completed");
      mutate();
    }
    setActionLoading(null);
    setOpenMenuId(null);
  }

  async function handleTogglePause(id: string, currentStatus: string) {
    setActionLoading(id);
    const newStatus = currentStatus === "paused_user" ? "active" : "paused_user";
    const { error } = await supabase
      .from("reminders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update reminder");
    } else {
      toast.success(newStatus === "active" ? "Reminder resumed" : "Reminder paused");
      mutate();
    }
    setActionLoading(null);
    setOpenMenuId(null);
  }

  async function handleDelete(id: string) {
    setActionLoading(id);
    const { error } = await supabase.from("reminders").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete reminder");
    } else {
      toast.success("Reminder deleted");
      mutate();
    }
    setActionLoading(null);
    setOpenMenuId(null);
  }

  if (!reminders || reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <Clock className="mb-4 h-10 w-10 text-muted-foreground/50" />
        <h3 className="font-medium text-foreground">No reminders yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first reminder to get started
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {reminders.map((r) => {
          const status = statusConfig[r.status];
          return (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-foreground">
                    {r.title}
                  </h3>
                  {r.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {r.due_date && (
                  <span>Due: {format(new Date(r.due_date), "MMM d, yyyy")}</span>
                )}
                <span>
                  Next: {format(new Date(r.next_send_at), "MMM d, h:mm a")}
                </span>
                <span>Every {r.current_interval_days}d</span>
                <span className="capitalize">{r.delivery_mode}</span>
              </div>

              {r.status !== "completed" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleComplete(r.id)}
                    disabled={actionLoading === r.id}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Done
                  </button>
                  <button
                    onClick={() =>
                      handleTogglePause(r.id, r.status)
                    }
                    disabled={actionLoading === r.id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                    aria-label={r.status === "paused_user" ? "Resume" : "Pause"}
                  >
                    {r.status === "paused_user" ? (
                      <Play className="h-3.5 w-3.5" />
                    ) : (
                      <Pause className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingReminder(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={actionLoading === r.id}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Due Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Next Reminder
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Interval
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((r) => {
              const status = statusConfig[r.status];
              return (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
                    {r.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.due_date
                      ? format(new Date(r.due_date), "MMM d, yyyy")
                      : "--"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(r.next_send_at), "MMM d, h:mm a")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.current_interval_days}d
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-end">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === r.id ? null : r.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuId === r.id && r.status !== "completed" && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-popover py-1 shadow-lg">
                          <button
                            onClick={() => handleComplete(r.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              handleTogglePause(r.id, r.status)
                            }
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary"
                          >
                            {r.status === "paused_user" ? (
                              <>
                                <Play className="h-3.5 w-3.5" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="h-3.5 w-3.5" />
                                Pause
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingReminder(r);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingReminder && (
        <EditReminderDialog
          reminder={editingReminder}
          onClose={() => setEditingReminder(null)}
          onSaved={() => {
            mutate();
            setEditingReminder(null);
          }}
        />
      )}
    </>
  );
}

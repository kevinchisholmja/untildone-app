"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateReminderDialog } from "./create-reminder-dialog";
import type { SubscriptionTier } from "@/lib/types";

export function CreateReminderButton({
  userId,
  tier,
}: {
  userId: string;
  tier: SubscriptionTier;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New Reminder
      </button>

      {open && (
        <CreateReminderDialog
          userId={userId}
          tier={tier}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

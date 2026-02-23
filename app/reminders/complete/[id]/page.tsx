"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CompleteReminderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reminderId = params.id as string;
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "confirm" | "completing" | "done" | "error"
  >("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // User is logged in -- complete immediately
        setStatus("completing");
        await completeReminder();
      } else {
        // No session -- show confirmation button
        setStatus("confirm");
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function completeReminder() {
    setStatus("completing");
    try {
      const res = await fetch("/api/reminders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reminderId, token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete reminder");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Bell className="h-6 w-6 text-primary-foreground" />
        </div>

        {status === "loading" || status === "completing" ? (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Completing your reminder...
            </p>
          </>
        ) : status === "confirm" ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Complete this reminder?
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Tap the button below to confirm you have completed this task. You
              will stop receiving emails for it.
            </p>
            <button
              onClick={completeReminder}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Confirm Completion
            </button>
          </>
        ) : status === "done" ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/20">
              <CheckCircle2 className="h-8 w-8 text-chart-2" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Reminder completed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Great work! You won&apos;t receive any more emails about this
              task.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {error}
            </p>
            <button
              onClick={completeReminder}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </main>
  );
}

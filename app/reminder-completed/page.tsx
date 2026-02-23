import Link from "next/link";
import { Bell, CheckCircle2 } from "lucide-react";

export default function ReminderCompletedPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Bell className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-chart-2/20">
          <CheckCircle2 className="h-8 w-8 text-chart-2" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Reminder completed
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Great work! This reminder has been marked as done and you won&apos;t
          receive any more emails about it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

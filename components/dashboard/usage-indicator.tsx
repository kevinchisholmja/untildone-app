"use client";

import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export function UsageIndicator({
  used,
  total,
  resetAt,
}: {
  used: number;
  total: number;
  resetAt: string;
}) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isExhausted = percentage >= 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Emails This Month
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${
            isExhausted
              ? "bg-destructive"
              : isWarning
                ? "bg-chart-5"
                : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Resets {format(new Date(resetAt), "MMM d, yyyy")}
        </span>
        {isWarning && !isExhausted && (
          <span className="flex items-center gap-1 text-xs font-medium text-chart-5">
            <AlertTriangle className="h-3 w-3" />
            Nearing limit
          </span>
        )}
        {isExhausted && (
          <span className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" />
            Quota exhausted
          </span>
        )}
      </div>
    </div>
  );
}

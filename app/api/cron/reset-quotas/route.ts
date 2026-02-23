import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Reset all users' email_quota_used to 0 and set next reset date
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  const { error, count } = await supabase
    .from("users")
    .update({
      email_quota_used: 0,
      quota_reset_at: nextReset.toISOString(),
    })
    .gte("id", "00000000-0000-0000-0000-000000000000"); // matches all rows

  if (error) {
    console.error("Failed to reset quotas:", error);
    return NextResponse.json(
      { error: "Failed to reset quotas" },
      { status: 500 }
    );
  }

  // Re-activate reminders that were paused due to quota
  const { error: reactivateError, count: reactivated } = await supabase
    .from("reminders")
    .update({ status: "active" })
    .eq("status", "paused_quota");

  if (reactivateError) {
    console.error("Failed to reactivate reminders:", reactivateError);
  }

  return NextResponse.json({
    reset: count ?? "all",
    reactivated: reactivated ?? 0,
  });
}

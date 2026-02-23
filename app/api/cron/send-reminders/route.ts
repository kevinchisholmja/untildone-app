import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function computeNextInterval(
  deliveryMode: string,
  emailsSent: number,
  baseInterval: number,
  currentInterval: number
): number {
  switch (deliveryMode) {
    case "aggressive":
      // Interval never changes
      return baseInterval;

    case "balanced":
      // After 30 sends, widen x2; after 60, widen again
      if (emailsSent >= 60) return baseInterval * 4;
      if (emailsSent >= 30) return baseInterval * 2;
      return baseInterval;

    case "gentle":
      // Gradually increase: every 10 sends, increase by baseInterval
      // Caps at 30 days
      const multiplier = Math.floor(emailsSent / 10) + 1;
      return Math.min(baseInterval * multiplier, 30);

    default:
      return currentInterval;
  }
}

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 1. Select active reminders due now where user has quota
  const { data: reminders, error: fetchError } = await supabase
    .from("reminders")
    .select(
      `
      id,
      user_id,
      title,
      description,
      due_date,
      delivery_mode,
      repeat_interval_days,
      current_interval_days,
      emails_sent_count,
      next_send_at
    `
    )
    .eq("status", "active")
    .lte("next_send_at", now)
    .limit(100);

  if (fetchError) {
    console.error("Failed to fetch reminders:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    );
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // Get unique user IDs
  const userIds = [...new Set(reminders.map((r) => r.user_id))];

  // Fetch all relevant users
  const { data: users } = await supabase
    .from("users")
    .select("id, email, email_quota_used, email_quota_monthly")
    .in("id", userIds);

  if (!users) {
    return NextResponse.json({ processed: 0 });
  }

  const userMap = new Map(users.map((u) => [u.id, u]));
  let processed = 0;
  let paused = 0;

  for (const reminder of reminders) {
    const user = userMap.get(reminder.user_id);
    if (!user) continue;

    // Check quota
    if (user.email_quota_used >= user.email_quota_monthly) {
      // Pause reminder due to quota
      await supabase
        .from("reminders")
        .update({ status: "paused_quota" })
        .eq("id", reminder.id);
      paused++;
      continue;
    }

    // Build the complete URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const completeUrl = `${baseUrl}/api/reminders/complete?id=${reminder.id}`;

    // Send email via Resend
    try {
      await resend.emails.send({
        from: "untildone <reminders@untildone.app>",
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 20px; font-weight: 600; color: #1a1a2e;">untildone</span>
            </div>
            <h1 style="font-size: 22px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px 0;">${reminder.title}</h1>
            ${reminder.description ? `<p style="font-size: 15px; color: #555; margin: 0 0 16px 0; line-height: 1.5;">${reminder.description}</p>` : ""}
            ${reminder.due_date ? `<p style="font-size: 14px; color: #888; margin: 0 0 24px 0;">Due: ${new Date(reminder.due_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>` : ""}
            <div style="text-align: center; margin: 32px 0;">
              <a href="${completeUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Mark Complete</a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center; margin-top: 32px;">This reminder will keep coming until you mark it done.</p>
          </div>
        `,
      });

      // Update reminder state
      const newEmailsSent = reminder.emails_sent_count + 1;
      const newInterval = computeNextInterval(
        reminder.delivery_mode,
        newEmailsSent,
        reminder.repeat_interval_days,
        reminder.current_interval_days
      );

      const nextSendAt = new Date(
        Date.now() + newInterval * 24 * 60 * 60 * 1000
      ).toISOString();

      await supabase
        .from("reminders")
        .update({
          emails_sent_count: newEmailsSent,
          current_interval_days: newInterval,
          last_sent_at: now,
          next_send_at: nextSendAt,
        })
        .eq("id", reminder.id);

      // Increment user quota
      await supabase
        .from("users")
        .update({
          email_quota_used: user.email_quota_used + 1,
        })
        .eq("id", user.id);

      // Update local map for subsequent reminders by same user
      user.email_quota_used += 1;

      processed++;
    } catch (emailError) {
      console.error(
        `Failed to send email for reminder ${reminder.id}:`,
        emailError
      );
    }
  }

  return NextResponse.json({ processed, paused });
}

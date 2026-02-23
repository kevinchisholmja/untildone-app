import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsageIndicator } from "@/components/dashboard/usage-indicator";
import { ReminderList } from "@/components/dashboard/reminder-list";
import { CreateReminderButton } from "@/components/dashboard/create-reminder-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: appUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!appUser) redirect("/login");

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            My Reminders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Persistent reminders that never stop until it&apos;s done
          </p>
        </div>
        <CreateReminderButton userId={user.id} tier={appUser.subscription_tier} />
      </div>

      <UsageIndicator
        used={appUser.email_quota_used}
        total={appUser.email_quota_monthly}
        resetAt={appUser.quota_reset_at}
      />

      <ReminderList
        initialReminders={reminders ?? []}
        userId={user.id}
      />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return <DashboardShell user={appUser}>{children}</DashboardShell>;
}

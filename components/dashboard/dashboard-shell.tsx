"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import type { AppUser } from "@/lib/types";

export function DashboardShell({
  user,
  children,
}: {
  user: AppUser;
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Bell className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">untildone</span>
          </Link>

          <div className="flex items-center gap-3">
            {(user.role === "super_admin" || user.role === "admin") && (
              <Link
                href="/admin"
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Shield className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

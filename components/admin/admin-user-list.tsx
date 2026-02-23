"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, ChevronDown } from "lucide-react";
import type { AppUser, SubscriptionTier } from "@/lib/types";
import { TIER_LIMITS } from "@/lib/types";

export function AdminUserList({
  initialUsers,
}: {
  initialUsers: AppUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  async function handleTierChange(userId: string, newTier: SubscriptionTier) {
    setUpdating(userId);

    const res = await fetch("/api/admin/update-user-tier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        subscription_tier: newTier,
        email_quota_monthly: TIER_LIMITS[newTier],
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Failed to update user");
    } else {
      toast.success(`User updated to ${newTier}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                subscription_tier: newTier,
                email_quota_monthly: TIER_LIMITS[newTier],
              }
            : u
        )
      );
    }

    setUpdating(null);
  }

  const tierBadgeClass: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    starter: "bg-primary/10 text-primary",
    pro: "bg-chart-2/20 text-chart-2",
  };

  const roleBadgeClass: Record<string, string> = {
    user: "bg-muted text-muted-foreground",
    admin: "bg-chart-4/20 text-chart-4",
    super_admin: "bg-chart-5/20 text-chart-5",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">
            {users.length}
          </p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">
            {users.filter((u) => u.subscription_tier !== "free").length}
          </p>
          <p className="text-xs text-muted-foreground">Paid Users</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">
            {users.reduce((sum, u) => sum + u.email_quota_used, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Emails Sent</p>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {user.email}
                </p>
                <div className="mt-1 flex gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass[user.role]}`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tierBadgeClass[user.subscription_tier]}`}
                  >
                    {user.subscription_tier}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                Quota: {user.email_quota_used}/{user.email_quota_monthly}
              </span>
              <span>
                Joined: {format(new Date(user.created_at), "MMM d, yyyy")}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-muted-foreground" htmlFor={`tier-${user.id}`}>
                Tier:
              </label>
              <div className="relative flex-1">
                <select
                  id={`tier-${user.id}`}
                  value={user.subscription_tier}
                  onChange={(e) =>
                    handleTierChange(
                      user.id,
                      e.target.value as SubscriptionTier
                    )
                  }
                  disabled={updating === user.id}
                  className="h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tier
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Quota Used
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0"
              >
                <td className="max-w-[200px] truncate px-4 py-3 font-medium text-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass[user.role]}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tierBadgeClass[user.subscription_tier]}`}
                  >
                    {user.subscription_tier}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">
                  {user.email_quota_used} / {user.email_quota_monthly}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <div className="relative">
                      <select
                        value={user.subscription_tier}
                        onChange={(e) =>
                          handleTierChange(
                            user.id,
                            e.target.value as SubscriptionTier
                          )
                        }
                        disabled={updating === user.id}
                        className="h-8 appearance-none rounded-lg border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
}

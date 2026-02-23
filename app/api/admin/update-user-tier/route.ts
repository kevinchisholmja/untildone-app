import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUserTierSchema } from "@/lib/validations";
import { TIER_LIMITS } from "@/lib/types";
import type { SubscriptionTier } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify super_admin role
    const { data: adminUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!adminUser || adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateUserTierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const quota =
      parsed.data.email_quota_monthly ??
      TIER_LIMITS[parsed.data.subscription_tier as SubscriptionTier];

    const { error } = await admin
      .from("users")
      .update({
        subscription_tier: parsed.data.subscription_tier,
        email_quota_monthly: quota,
      })
      .eq("id", parsed.data.user_id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TIER_RATE_LIMITS } from "@/lib/types";
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

    const body = await req.json();
    const tier = (body.tier || "free") as SubscriptionTier;
    const limits = TIER_RATE_LIMITS[tier];

    // Count reminders created in the rate limit window
    const windowStart = new Date(
      Date.now() - limits.windowMinutes * 60 * 1000
    ).toISOString();

    const { count, error } = await supabase
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", windowStart);

    if (error) {
      return NextResponse.json(
        { error: "Failed to check rate" },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= limits.max) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Max ${limits.max} reminders per ${limits.windowMinutes} minutes for ${tier} tier.`,
        },
        { status: 429 }
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

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createCompleteToken } from "@/lib/reminders/tokens";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, token } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing reminder ID" },
        { status: 400 }
      );
    }

    // Method 1: Authenticated user completing their own reminder
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // User is logged in -- use their session (RLS will enforce ownership)
      const { error } = await supabase
        .from("reminders")
        .update({ status: "completed" })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to complete reminder" },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Method 2: Unauthenticated user with a valid token from email
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const expectedToken = createCompleteToken(id);
    if (token !== expectedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    // Valid token -- use admin client to bypass RLS
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from("reminders")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to complete reminder" },
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

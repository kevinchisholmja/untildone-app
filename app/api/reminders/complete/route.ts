import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public endpoint for completing reminders from email links
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing reminder ID" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("reminders")
    .update({ status: "completed" })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to complete reminder" },
      { status: 500 }
    );
  }

  // Redirect to a success page
  return NextResponse.redirect(new URL("/reminder-completed", req.url));
}

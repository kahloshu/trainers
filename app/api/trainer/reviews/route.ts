
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { validateSession, SESSION_COOKIE } from "@/lib/trainer-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await validateSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("trainer_id", session.trainerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[trainer/reviews] fetch failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const reviews = (data ?? []).map((row) => ({
    id:           row.id,
    trainerId:    row.trainer_id,
    authorMasked: row.author_masked,
    rating:       row.rating,
    comment:      row.comment,
    daysAgo:      Math.floor((now.getTime() - new Date(row.created_at).getTime()) / 86400000),
  }));

  return NextResponse.json({ reviews });
}

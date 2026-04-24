
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { validateSession, SESSION_COOKIE } from "@/lib/trainer-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await validateSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { session: sessionNum, completed } = await request.json();

  if (sessionNum !== 1 && sessionNum !== 2) {
    return NextResponse.json({ error: "session must be 1 or 2" }, { status: 400 });
  }

  const field = sessionNum === 1 ? "session1_completed_at" : "session2_completed_at";
  const value = completed ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("applications")
    .update({ [field]: value })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

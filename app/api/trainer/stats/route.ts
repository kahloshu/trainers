export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateSession, SESSION_COOKIE } from "@/lib/trainer-session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await validateSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("trainer_id", session.trainerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const apps = data ?? [];
  return NextResponse.json({
    total:     apps.length,
    pending:   apps.filter((a) => ["pending", "received", "checking", "contact_scheduled", "scheduling"].includes(a.status)).length,
    confirmed: apps.filter((a) => a.status === "confirmed").length,
    completed: apps.filter((a) => a.status === "completed").length,
  });
}

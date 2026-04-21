export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateSession, SESSION_COOKIE } from "@/lib/trainer-session";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await validateSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("trainer_id", session.trainerId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const apps = (data ?? []).map((row) => ({
    id:               row.id,
    applicationNumber: row.application_number ?? "",
    applicantName:    row.applicant_name,
    applicantPhone:   row.applicant_phone,
    trainerId:        row.trainer_id,
    trainerName:      row.trainer_name,
    purposes:         row.purposes ?? [],
    preferredDays:    row.preferred_days ?? [],
    preferredTimes:   row.preferred_times ?? [],
    userMessage:      row.user_message ?? "",
    adminNote:        row.admin_note ?? "",
    status:           row.status,
    createdAt:        row.created_at,
    createdMinutesAgo: Math.floor((now.getTime() - new Date(row.created_at).getTime()) / 60000),
  }));

  return NextResponse.json({ applications: apps });
}

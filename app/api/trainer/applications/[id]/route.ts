
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { validateSession, SESSION_COOKIE } from "@/lib/trainer-auth";

const VALID_STATUSES = ["pending","received","checking","contact_scheduled","scheduling","confirmed","completed","cancelled"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await validateSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "올바르지 않은 상태값입니다." }, { status: 400 });
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .eq("trainer_id", session.trainerId);

  if (error) {
    console.error("[trainer/applications/:id PATCH] status update failed:", error.message, { id, status });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await validateSession(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("trainer_id", session.trainerId) // 권한 확인: 본인 신청만
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
  }

  const now = new Date();
  return NextResponse.json({
    application: {
      id:               data.id,
      applicationNumber: data.application_number ?? "",
      applicantName:    data.applicant_name,
      applicantPhone:   data.applicant_phone,
      trainerId:        data.trainer_id,
      trainerName:      data.trainer_name,
      purposes:         data.purposes ?? [],
      preferredDays:    data.preferred_days ?? [],
      preferredTimes:   data.preferred_times ?? [],
      userMessage:      data.user_message ?? "",
      adminNote:        data.admin_note ?? "",
      status:              data.status,
      createdAt:           data.created_at,
      createdMinutesAgo:   Math.floor((now.getTime() - new Date(data.created_at).getTime()) / 60000),
      session1CompletedAt: data.session1_completed_at ?? undefined,
      session2CompletedAt: data.session2_completed_at ?? undefined,
    },
  });
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateSession, SESSION_COOKIE } from "@/lib/trainer-session";

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
      status:           data.status,
      createdAt:        data.created_at,
      createdMinutesAgo: Math.floor((now.getTime() - new Date(data.created_at).getTime()) / 60000),
    },
  });
}

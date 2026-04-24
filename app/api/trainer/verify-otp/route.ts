
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/trainer-auth";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();
  if (!phone || !code) {
    return NextResponse.json({ error: "전화번호와 인증코드를 입력해주세요." }, { status: 400 });
  }

  const normalized = phone.replace(/\D/g, "");

  // 유효한 OTP 조회
  const { data: otp, error } = await supabase
    .from("trainer_otp")
    .select("id, code, attempt_count, expires_at")
    .eq("phone", normalized)
    .eq("used", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !otp) {
    return NextResponse.json({ error: "인증코드가 없거나 만료되었습니다. 다시 요청해주세요." }, { status: 400 });
  }

  if (new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ error: "인증코드가 만료되었습니다. 다시 요청해주세요." }, { status: 400 });
  }

  if (otp.attempt_count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "시도 횟수를 초과했습니다. 인증코드를 다시 요청해주세요." }, { status: 429 });
  }

  if (otp.code !== code) {
    // 시도 횟수 증가
    await supabase
      .from("trainer_otp")
      .update({ attempt_count: otp.attempt_count + 1 })
      .eq("id", otp.id);
    return NextResponse.json({ error: "인증코드가 올바르지 않습니다." }, { status: 400 });
  }

  // OTP 즉시 삭제 (사용 후 보관 불필요)
  await supabase.from("trainer_otp").delete().eq("id", otp.id);

  // 트레이너 조회
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, name, phone")
    .eq("phone", normalized)
    .single();

  if (!trainer) {
    return NextResponse.json({ error: "트레이너 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  // 세션 생성 (7일)
  const expires_at = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();
  const { data: session, error: sessErr } = await supabase
    .from("trainer_sessions")
    .insert({ trainer_id: trainer.id, expires_at })
    .select("token")
    .single();

  if (sessErr || !session) {
    return NextResponse.json({ error: "세션 생성에 실패했습니다." }, { status: 500 });
  }

  const response = NextResponse.json({
    success: true,
    trainer: { id: trainer.id, name: trainer.name },
  });

  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}

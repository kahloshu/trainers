
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { generateOtp, sendSms } from "@/lib/otp";

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ error: "전화번호를 입력해주세요." }, { status: 400 });

  const normalized = phone.replace(/\D/g, "");

  // 해당 전화번호의 트레이너가 존재하는지 확인
  const { data: trainer, error } = await supabase
    .from("trainers")
    .select("id, name")
    .eq("phone", normalized)
    .single();

  if (error || !trainer) {
    return NextResponse.json({ error: "등록되지 않은 전화번호입니다." }, { status: 404 });
  }

  // 기존 OTP 전체 정리 (미사용 + 만료)
  await supabase.from("trainer_otp").delete().eq("phone", normalized);

  // 새 OTP 생성 (5분 유효)
  const code = generateOtp();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: insertErr } = await supabase
    .from("trainer_otp")
    .insert({ phone: normalized, code, expires_at });

  if (insertErr) {
    return NextResponse.json({ error: "인증코드 생성에 실패했습니다." }, { status: 500 });
  }

  // SMS 발송 (현재는 콘솔 출력, SMS 서비스 연동 후 실제 발송)
  await sendSms(normalized, code);

  return NextResponse.json({
    success: true,
    trainerName: trainer.name,
    // SMS 미연동 상태 테스트용: SMS 연동 후 이 줄 제거
    devCode: code,
  });
}

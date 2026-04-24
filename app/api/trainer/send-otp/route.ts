
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { generateOtp, sendSms } from "@/lib/otp";

const OTP_RATE_LIMIT_MS = 60_000; // 60초

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  if (!phone) return NextResponse.json({ error: "전화번호를 입력해주세요." }, { status: 400 });

  const normalized = phone.replace(/\D/g, "");

  // 트레이너 존재 확인
  const { data: trainer, error } = await supabase
    .from("trainers")
    .select("id, name")
    .eq("phone", normalized)
    .single();

  if (error || !trainer) {
    console.error("[trainer/send-otp] trainer not found:", { normalized, error: error?.message });
    return NextResponse.json({ error: "등록되지 않은 전화번호입니다." }, { status: 404 });
  }

  // 60초 이내 재발송 방지
  const { count: recentCount } = await supabase
    .from("trainer_otp")
    .select("*", { count: "exact", head: true })
    .eq("phone", normalized)
    .gte("created_at", new Date(Date.now() - OTP_RATE_LIMIT_MS).toISOString());

  if ((recentCount ?? 0) > 0) {
    return NextResponse.json(
      { error: "인증코드를 이미 발송했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  // 기존 OTP 정리 후 새로 생성
  await supabase.from("trainer_otp").delete().eq("phone", normalized);

  const code = generateOtp();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: insertErr } = await supabase
    .from("trainer_otp")
    .insert({ phone: normalized, code, expires_at });

  if (insertErr) {
    console.error("[trainer/send-otp] OTP insert failed:", insertErr.message);
    return NextResponse.json({ error: "인증코드 생성에 실패했습니다." }, { status: 500 });
  }

  await sendSms(normalized, code);

  return NextResponse.json({
    success: true,
    trainerName: trainer.name,
    ...(process.env.NODE_ENV === "development" && { devCode: code }),
  });
}

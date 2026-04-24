
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();
  if (!phone || !code) {
    return NextResponse.json({ error: "전화번호와 인증코드를 입력해주세요." }, { status: 400 });
  }

  const normalized = phone.replace(/\D/g, "");

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
    await supabase
      .from("trainer_otp")
      .update({ attempt_count: otp.attempt_count + 1 })
      .eq("id", otp.id);
    return NextResponse.json({ error: "인증코드가 올바르지 않습니다." }, { status: 400 });
  }

  await supabase.from("trainer_otp").delete().eq("id", otp.id);

  return NextResponse.json({ success: true, phone: phone.trim() });
}

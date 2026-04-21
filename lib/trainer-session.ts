import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SESSION_COOKIE = "trainer_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일 (초)

export interface TrainerSession {
  trainerId: string;
  trainerName: string;
  phone: string;
}

/** API Route에서 세션 토큰을 검증하고 트레이너 정보 반환 */
export async function validateSession(token: string | undefined): Promise<TrainerSession | null> {
  if (!token) return null;

  const { data, error } = await supabase
    .from("trainer_sessions")
    .select("trainer_id, expires_at, trainers(id, name, phone)")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const t = data.trainers as unknown as { id: string; name: string; phone: string } | null;
  if (!t) return null;

  return { trainerId: t.id, trainerName: t.name, phone: t.phone ?? "" };
}

/** OTP 생성 (6자리 숫자) */
export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** SMS 발송 훅 (SMS 서비스 연동 시 여기에 구현) */
export async function sendSms(phone: string, code: string): Promise<void> {
  // TODO: Twilio / 네이버 클라우드 SMS 등 연동
  // 개발 환경에서는 콘솔 출력
  console.log(`[OTP] ${phone} → ${code}`);
}

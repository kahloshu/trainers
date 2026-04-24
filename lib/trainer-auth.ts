import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export const SESSION_COOKIE  = "trainer_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일 (초)

export interface TrainerSession {
  trainerId:   string;
  trainerName: string;
  phone:       string;
}

/** API Route에서 세션 토큰을 검증하고 트레이너 정보 반환 */
export async function validateSession(token: string | undefined): Promise<TrainerSession | null> {
  if (!token) return null;

  const { data: session, error } = await supabase
    .from("trainer_sessions")
    .select("trainer_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !session) return null;
  if (new Date(session.expires_at) < new Date()) return null;

  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, name, phone")
    .eq("id", session.trainer_id)
    .single();

  if (!trainer) return null;

  return { trainerId: trainer.id, trainerName: trainer.name, phone: trainer.phone ?? "" };
}

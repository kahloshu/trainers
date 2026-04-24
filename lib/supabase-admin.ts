import { createClient } from "@supabase/supabase-js";

// 서버 전용 (API Routes / Server Components)
// NEXT_PUBLIC_ 아님 → 클라이언트 번들에 포함되지 않음, 절대 노출 금지
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set (server-only)");
}

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8_000);
  return fetch(input, { ...init, signal: ac.signal }).finally(() => clearTimeout(timer));
}

export const supabaseAdmin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: fetchWithTimeout },
});

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/trainer-session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    await supabase.from("trainer_sessions").delete().eq("token", token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}

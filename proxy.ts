import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "trainer_session";

// /admin — OTP 기반 세션 쿠키로 보호 (트레이너/관리자 모바일 앱)
// /dashboard — Supabase Auth (이메일+비밀번호)로 보호하며, 레이아웃에서 클라이언트 측 처리
const PROTECTED_ROUTES: { prefix: string; loginPath: string }[] = [
  { prefix: "/admin", loginPath: "/admin/login" },
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  for (const { prefix, loginPath } of PROTECTED_ROUTES) {
    if (!pathname.startsWith(prefix)) continue;
    if (pathname === loginPath) continue;

    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

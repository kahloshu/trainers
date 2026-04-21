import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "trainer_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login 은 보호하지 않음
  if (pathname === "/admin/login") return NextResponse.next();

  // /admin/* 는 쿠키 없으면 로그인 페이지로 이동
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

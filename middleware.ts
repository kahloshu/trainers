import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "trainer_session";

const PROTECTED_ROUTES: { prefix: string; loginPath: string }[] = [
  { prefix: "/admin", loginPath: "/admin/login" },
];

export function middleware(request: NextRequest) {
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

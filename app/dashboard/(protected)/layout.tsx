"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, onAuthChange } from "@/lib/auth";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ThemeProvider, useTheme } from "@/app/dashboard/ThemeContext";

/* 각 경로별 헤더 타이틀 */
function getTitle(pathname: string): string {
  if (pathname === "/dashboard")                      return "개요";
  if (pathname.startsWith("/dashboard/applications")) return "신청 관리";
  if (pathname.startsWith("/dashboard/trainers"))     return "트레이너 관리";
  if (pathname.startsWith("/dashboard/reviews"))      return "후기 관리";
  if (pathname.startsWith("/dashboard/stats"))        return "통계";
  return "대시보드";
}

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const [authState, setAuthState] = useState<"loading" | "authed" | "none">("loading");
  const [userEmail, setUserEmail] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  /* ── 초기 세션 확인 ── */
  useEffect(() => {
    getSession().then((s) => {
      if (s) {
        setUserEmail(s.user.email ?? "");
        setAuthState("authed");
      } else {
        setAuthState("none");
      }
    });
  }, []);

  /* ── 세션 변화 감지 ── */
  useEffect(() => {
    const { data: { subscription } } = onAuthChange((session) => {
      if (session) {
        setUserEmail(session.user.email ?? "");
        setAuthState("authed");
      } else {
        setAuthState("none");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  /* ── 미인증 → 로그인 ── */
  useEffect(() => {
    if (authState === "none") {
      router.replace("/dashboard/login");
    }
  }, [authState, router]);

  const toggleSidebar = useCallback(() => setCollapsed((v) => !v), []);

  /* ── 로딩 ── */
  if (authState !== "authed") {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center dash-root${theme === "light" ? " light" : ""}`}
        style={{ background: "var(--dash-bg)" }}
      >
        <div
          className="w-9 h-9 rounded-full border-2 animate-spin"
          style={{ borderColor: "#8eabff", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 flex overflow-hidden dash-root${theme === "light" ? " light" : ""}`}
      style={{ background: "var(--dash-bg)", fontFamily: "var(--font-lexend), sans-serif" }}
    >
      {/* 사이드바 */}
      <Sidebar collapsed={collapsed} />

      {/* 메인 영역 */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 헤더 */}
        <Header
          title={getTitle(pathname)}
          userEmail={userEmail}
          onToggleSidebar={toggleSidebar}
          theme={theme}
          onToggleTheme={toggle}
        />

        {/* 콘텐츠 스크롤 영역 */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--dash-bg)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </ThemeProvider>
  );
}

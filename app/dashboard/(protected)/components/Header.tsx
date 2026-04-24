"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/admin-auth";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface HeaderProps {
  title: string;
  userEmail: string;
  onToggleSidebar: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Header({ title, userEmail, onToggleSidebar, theme, onToggleTheme }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace("/dashboard/login");
  }

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : "A";
  const isLight  = theme === "light";

  return (
    <header
      className="flex items-center justify-between px-5"
      style={{
        height: 64,
        background: "var(--dash-header-bg)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        flexShrink: 0,
      }}
    >
      {/* 왼쪽: 토글 + 페이지 타이틀 */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: "var(--dash-text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--dash-hover-btn)";
            (e.currentTarget as HTMLElement).style.color = "var(--dash-text)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)";
          }}
        >
          <MenuIcon />
        </button>
        <h1 className="text-[16px] font-semibold" style={{ color: "var(--dash-text)" }}>
          {title}
        </h1>
      </div>

      {/* 오른쪽: 테마 토글 + 알림 + 유저 */}
      <div className="flex items-center gap-2">

        {/* 테마 토글 버튼 */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all"
          title={isLight ? "다크 모드로 전환" : "라이트 모드로 전환"}
          style={{
            color: isLight ? "#2F6BFF" : "var(--dash-text-muted)",
            background: isLight ? "rgba(47,107,255,0.10)" : "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = isLight
              ? "rgba(47,107,255,0.16)"
              : "var(--dash-hover-btn)";
            (e.currentTarget as HTMLElement).style.color = isLight ? "#2F6BFF" : "var(--dash-text)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = isLight
              ? "rgba(47,107,255,0.10)"
              : "transparent";
            (e.currentTarget as HTMLElement).style.color = isLight ? "#2F6BFF" : "var(--dash-text-muted)";
          }}
        >
          {isLight ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* 알림 버튼 (placeholder) */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: "var(--dash-text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--dash-hover-btn)";
            (e.currentTarget as HTMLElement).style.color = "var(--dash-text)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)";
          }}
        >
          <BellIcon />
        </button>

        {/* 구분선 */}
        <div className="w-px h-5 mx-1" style={{ background: "var(--dash-hover-btn)" }} />

        {/* 유저 배지 */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ background: "linear-gradient(135deg, #2F6BFF, #1a55d4)", color: "#fff" }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-medium leading-tight" style={{ color: "var(--dash-text)" }}>
              관리자
            </p>
            <p className="text-[11px] leading-tight" style={{ color: "var(--dash-text-dimmed)" }}>
              {userEmail}
            </p>
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{ color: "var(--dash-text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)";
          }}
        >
          <LogoutIcon />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}

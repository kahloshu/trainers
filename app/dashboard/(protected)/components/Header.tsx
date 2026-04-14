"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

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

interface HeaderProps {
  title: string;
  userEmail: string;
  onToggleSidebar: () => void;
}

export default function Header({ title, userEmail, onToggleSidebar }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace("/dashboard/login");
  }

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : "A";

  return (
    <header
      className="flex items-center justify-between px-5"
      style={{
        height: 64,
        background: "rgba(14,14,14,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      {/* 왼쪽: 토글 + 페이지 타이틀 */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: "#5a5a5a" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#5a5a5a";
          }}
        >
          <MenuIcon />
        </button>
        <h1 className="text-[16px] font-semibold" style={{ color: "#ffffff" }}>
          {title}
        </h1>
      </div>

      {/* 오른쪽: 알림 + 유저 */}
      <div className="flex items-center gap-2">
        {/* 알림 버튼 (placeholder) */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: "#5a5a5a" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#5a5a5a";
          }}
        >
          <BellIcon />
        </button>

        {/* 구분선 */}
        <div className="w-px h-5 mx-1" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* 유저 배지 */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ background: "linear-gradient(135deg, #8eabff, #156aff)", color: "#000" }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-medium leading-tight" style={{ color: "#ffffff" }}>
              관리자
            </p>
            <p className="text-[11px] leading-tight" style={{ color: "#3a3a3a" }}>
              {userEmail}
            </p>
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{ color: "#5a5a5a" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#5a5a5a";
          }}
        >
          <LogoutIcon />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}

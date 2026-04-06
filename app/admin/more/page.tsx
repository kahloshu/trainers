"use client";

import Link from "next/link";
import AdminBottomNav from "@/app/admin/components/AdminBottomNav";

/* ── 아이콘 ── */
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#8eabff" strokeWidth="1.6" />
      <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
        stroke="#8eabff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="#8eabff" strokeWidth="1.6" />
      <path d="M9 4V3C9 2.45 9.45 2 10 2H14C14.55 2 15 2.45 15 3V4"
        stroke="#8eabff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11H15M9 15H13" stroke="#8eabff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke="#8eabff" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        stroke="#8eabff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#5a5a5a" strokeWidth="1.6" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="#5a5a5a" strokeWidth="1.6" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#5a5a5a" strokeWidth="1.6" />
      <line x1="12" y1="8" x2="12" y2="12" stroke="#5a5a5a" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="#5a5a5a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── 메뉴 항목 ── */
function MenuItem({
  icon,
  label,
  desc,
  href,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-4 py-4 transition-opacity active:opacity-70"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "#1a1a1a" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[14px] font-medium" style={{ color: "#ffffff" }}>{label}</span>
        {desc && <p className="text-[11.5px] mt-0.5" style={{ color: "#5a5a5a" }}>{desc}</p>}
      </div>
      {badge && (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "rgba(142,171,255,0.12)", color: "#8eabff" }}
        >
          {badge}
        </span>
      )}
      <ChevronRight />
    </Link>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-5 pb-2 text-[11px] font-semibold tracking-[0.15em] uppercase"
      style={{ color: "#3a3a3a" }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.04)" }} />;
}

/* ── 페이지 ── */
export default function AdminMorePage() {
  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40 px-4 pt-5 pb-4"
        style={{
          background: "rgba(14,14,14,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
          style={{ color: "#8eabff" }}>관리</p>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>
          더보기
        </h1>
      </header>

      <div className="pb-28">

        {/* ── 관리 메뉴 ── */}
        <SectionTitle>관리</SectionTitle>
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <MenuItem
            icon={<HomeIcon />}
            label="관리자 홈"
            desc="통계 및 최근 현황"
            href="/admin"
          />
          <Divider />
          <MenuItem
            icon={<ClipboardIcon />}
            label="OT 신청 관리"
            desc="신청 목록 및 상태 변경"
            href="/admin/applications"
          />
          <Divider />
          <MenuItem
            icon={<StarIcon />}
            label="후기 관리"
            desc="후기 노출 여부 설정"
            href="/admin/reviews"
          />
          <Divider />
          <MenuItem
            icon={<PersonIcon />}
            label="트레이너 관리"
            desc="트레이너 등록·수정·삭제"
            href="/admin/trainers"
          />
        </div>

        {/* ── 알림 ── */}
        <SectionTitle>알림</SectionTitle>
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <MenuItem
            icon={<BellIcon />}
            label="알림 설정"
            desc="신청·후기 푸시 알림 설정"
            href="/admin/more"
            badge="준비 중"
          />
        </div>

        {/* ── 앱 정보 ── */}
        <SectionTitle>앱 정보</SectionTitle>
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <MenuItem
            icon={<GearIcon />}
            label="설정"
            desc="앱 기본 설정"
            href="/admin/more"
            badge="준비 중"
          />
          <Divider />
          <MenuItem
            icon={<InfoIcon />}
            label="앱 버전"
            desc="제임스짐 관리자 v0.1.0"
            href="/admin/more"
          />
        </div>

        {/* ── 서비스 정보 ── */}
        <div className="mx-4 mt-6 px-1">
          <p className="text-[11.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.06)" }}>
            제임스짐 관리자 페이지 · v0.1.0<br />
            문의: admin@jamesgym.kr
          </p>
        </div>

      </div>

      <AdminBottomNav />
    </div>
  );
}

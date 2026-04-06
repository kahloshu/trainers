"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  APPLICATIONS,
  STATUS_LABEL,
  DAY_LABEL,
  TIME_LABEL,
  timeAgoLabel,
  type AppStatus,
  type Application,
} from "@/app/data/applications";
import AdminBottomNav from "@/app/admin/components/AdminBottomNav";

/* ── 상태 색상 ── */
const STATUS_COLOR: Record<AppStatus, { bg: string; text: string; dot: string }> = {
  pending:   { bg: "rgba(248,113,113,0.10)",   text: "#f87171", dot: "#f87171" },
  confirmed: { bg: "rgba(234,179,8,0.10)",   text: "#fbbf24", dot: "#eab308" },
  completed: { bg: "rgba(52,211,153,0.10)",  text: "#34d399", dot: "#10b981" },
  cancelled: { bg: "rgba(90,90,90,0.10)", text: "#a0a0a0", dot: "#5a5a5a" },
};

/* ── 필터 탭 정의 ── */
const TABS: { id: AppStatus | "all"; label: string }[] = [
  { id: "all",       label: "전체"   },
  { id: "pending",   label: "대기 중" },
  { id: "confirmed", label: "확정됨" },
  { id: "completed", label: "완료"   },
  { id: "cancelled", label: "취소됨" },
];

/* ── 아이콘 ── */
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21.72 16.92z"
        stroke="#a0a0a0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="#8eabff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#5a5a5a" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="#5a5a5a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#5a5a5a" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="#5a5a5a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#5a5a5a" strokeWidth="1.5" />
      <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
        stroke="#5a5a5a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ── 신청 카드 ── */
function AppCard({
  app,
  onConfirm,
}: {
  app: Application;
  onConfirm: (id: string) => void;
}) {
  const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}
    >
      {/* 카드 본문 */}
      <div className="p-4 flex flex-col gap-3">

        {/* 1행: 이름 + 상태 + 시간 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[15px] font-semibold truncate" style={{ color: "#ffffff" }}>
              {app.applicantName}
            </span>
            <StatusBadge status={app.status} />
          </div>
          <span className="text-[11px] flex-shrink-0" style={{ color: "#3a3a3a" }}>
            {timeAgoLabel(app.createdMinutesAgo)}
          </span>
        </div>

        {/* 2행: 연락처 */}
        <div className="flex items-center gap-1.5">
          <PhoneIcon />
          <span className="text-[12.5px] font-medium" style={{ color: "#a0a0a0" }}>
            {app.applicantPhone}
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* 3행: 트레이너 */}
        <div className="flex items-center gap-1.5">
          <PersonIcon />
          <span className="text-[12.5px]" style={{ color: "#a0a0a0" }}>
            {app.trainerName} 트레이너
          </span>
        </div>

        {/* 4행: 희망 요일 */}
        <div className="flex items-start gap-1.5">
          <span className="mt-0.5"><CalendarIcon /></span>
          <span className="text-[12.5px] leading-snug" style={{ color: "#a0a0a0" }}>
            {days}
          </span>
        </div>

        {/* 5행: 희망 시간대 */}
        <div className="flex items-center gap-1.5">
          <ClockIcon />
          <span className="text-[12.5px]" style={{ color: "#a0a0a0" }}>
            {times}
          </span>
        </div>

        {/* 회원 요청사항 */}
        {app.userMessage && (
          <div
            className="px-3 py-2.5 rounded-xl"
            style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[11.5px] leading-relaxed" style={{ color: "#5a5a5a" }}>
              &ldquo;{app.userMessage}&rdquo;
            </p>
          </div>
        )}

        {/* 관리자 메모 */}
        {app.adminNote && (
          <div
            className="flex items-start gap-1.5 px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(142,171,255,0.06)", border: "1px solid rgba(142,171,255,0.10)" }}
          >
            <span className="mt-0.5 flex-shrink-0"><NoteIcon /></span>
            <p className="text-[11.5px] leading-snug" style={{ color: "#5a5a5a" }}>
              {app.adminNote}
            </p>
          </div>
        )}
      </div>

      {/* 카드 하단 액션 */}
      <div
        className="flex border-t"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        {/* 상태별 주요 액션 버튼 */}
        {app.status === "pending" && (
          <button
            onClick={() => onConfirm(app.id)}
            className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
            style={{ color: "#34d399" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            확정하기
          </button>
        )}
        {app.status === "confirmed" && (
          <button
            onClick={() => onConfirm(app.id)}
            className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
            style={{ color: "#fbbf24" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            완료 처리
          </button>
        )}
        {(app.status === "completed" || app.status === "cancelled") && (
          <div className="flex-1 py-3 flex items-center justify-center">
            <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.06)" }}>처리 완료</span>
          </div>
        )}

        {/* 구분 */}
        <div className="w-px" style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* 상세 보기 */}
        <Link
          href={`/admin/applications/${app.id}`}
          className="flex items-center justify-center gap-1 px-5 py-3 text-[13px] font-medium transition-opacity active:opacity-70"
          style={{ color: "#a0a0a0" }}
        >
          상세보기
          <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyState({ status }: { status: AppStatus | "all" }) {
  const messages: Record<string, string> = {
    all:       "신청 내역이 없습니다.",
    pending:   "대기 중인 신청이 없습니다.",
    confirmed: "확정된 신청이 없습니다.",
    completed: "완료된 신청이 없습니다.",
    cancelled: "취소된 신청이 없습니다.",
  };
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: "rgba(142,171,255,0.07)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="4" width="14" height="17" rx="2" stroke="#3a3a3a" strokeWidth="1.6" />
          <path d="M9 10h6M9 14h4" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[13px]" style={{ color: "#3a3a3a" }}>
        {messages[status]}
      </p>
    </div>
  );
}

/* ── 페이지 ── */
export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState<AppStatus | "all">("pending");
  const [apps, setApps] = useState(APPLICATIONS);

  /* 탭별 카운트 */
  const counts = useMemo(() => ({
    all:       apps.length,
    pending:   apps.filter((a) => a.status === "pending").length,
    confirmed: apps.filter((a) => a.status === "confirmed").length,
    completed: apps.filter((a) => a.status === "completed").length,
    cancelled: apps.filter((a) => a.status === "cancelled").length,
  }), [apps]);

  /* 필터된 목록 */
  const filtered = useMemo(
    () => activeTab === "all" ? apps : apps.filter((a) => a.status === activeTab),
    [apps, activeTab]
  );

  /* 확정/완료 처리 (로컬 mock) */
  function handleConfirm(id: string) {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: a.status === "pending" ? "confirmed" : "completed",
        };
      })
    );
  }

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#8eabff" }}>
              관리
            </p>
            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>
              신청 관리
            </h1>
          </div>
          {/* 전체 카운트 */}
          <div
            className="px-3 py-1.5 rounded-full"
            style={{ background: "rgba(142,171,255,0.10)", border: "1px solid rgba(142,171,255,0.2)" }}
          >
            <span className="text-[12px] font-semibold" style={{ color: "#8eabff" }}>
              전체 {counts.all}건
            </span>
          </div>
        </div>

        {/* 상태 필터 탭 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150"
                style={{
                  background:   isActive ? "#156aff" : "#1a1a1a",
                  color:        isActive ? "#fff"    : "#5a5a5a",
                  border:       `1.5px solid ${isActive ? "#156aff" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.2)" : tab.id === "pending" ? "rgba(248,113,113,0.15)" : "#131313",
                      color:      isActive ? "#fff" : tab.id === "pending" ? "#f87171" : "#5a5a5a",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── 목록 ── */}
      <main className="page-scroll px-4 pt-3">

        {/* 결과 수 */}
        <p className="text-[12px] mb-3" style={{ color: "#3a3a3a" }}>
          {filtered.length}건
        </p>

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((app) => (
              <AppCard key={app.id} app={app} onConfirm={handleConfirm} />
            ))}

            <p className="text-center text-[12px] py-4" style={{ color: "rgba(255,255,255,0.06)" }}>
              — 모두 확인했습니다 —
            </p>
          </div>
        ) : (
          <EmptyState status={activeTab} />
        )}
      </main>

      <AdminBottomNav />
    </div>
  );
}

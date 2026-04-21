"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getApplicationsByPhone,
  STATUS_LABEL,
  DAY_LABEL,
  TIME_LABEL,
  timeAgoLabel,
  type Application,
  type AppStatus,
} from "@/app/data/applications";
import { getReviewsByPhone } from "@/app/data/trainers";
import BottomNav from "@/app/components/BottomNav";

/* ── 탭 ── */
const TABS = [
  { id: "all",       label: "전체" },
  { id: "received",  label: "접수됨" },
  { id: "confirmed", label: "확정됨" },
  { id: "completed", label: "완료" },
  { id: "cancelled", label: "취소" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ── 상태 스타일 ── */
const STATUS_STYLE: Record<AppStatus, { bg: string; text: string; dot: string }> = {
  pending:           { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", dot: "#60a5fa" },
  received:          { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", dot: "#60a5fa" },
  checking:          { bg: "rgba(251,191,36,0.10)",  text: "#fbbf24", dot: "#fbbf24" },
  contact_scheduled: { bg: "rgba(167,139,250,0.10)", text: "#a78bfa", dot: "#a78bfa" },
  scheduling:        { bg: "rgba(251,146,60,0.10)",  text: "#fb923c", dot: "#fb923c" },
  confirmed:         { bg: "rgba(234,179,8,0.10)",   text: "#fbbf24", dot: "#eab308" },
  completed:         { bg: "rgba(52,211,153,0.10)",  text: "#34d399", dot: "#10b981" },
  cancelled:         { bg: "rgba(90,90,90,0.10)",    text: "#a0a0a0", dot: "#5a5a5a" },
};

/* ── 아이콘 ── */
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ClipboardEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="#131313" strokeWidth="1.5" />
      <path d="M9 4V3C9 2.45 9.45 2 10 2H14C14.55 2 15 2.45 15 3V4"
        stroke="#131313" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 11H15M9 15H13" stroke="#131313" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#c9a96e" />
    </svg>
  );
}

/* ── 신청 카드 ── */
function AppCard({ app, reviewedTrainerIds }: { app: Application; reviewedTrainerIds: Set<string> }) {
  const style = STATUS_STYLE[app.status];
  const canWriteReview = app.status === "completed";
  const hasReview = reviewedTrainerIds.has(app.trainerId);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* 상단: 트레이너 + 상태 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: "#ffffff" }}>
            {app.trainerName} 트레이너
          </p>
          <p className="text-[11.5px] mt-0.5" style={{ color: "#5a5a5a" }}>
            {app.purposes.join(" · ")}
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: style.bg, color: style.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
          {STATUS_LABEL[app.status]}
        </span>
      </div>

      <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.04)" }} />

      {/* 희망 일정 */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5">
        {app.preferredDays.map((d: string) => (
          <span
            key={d}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#0e0e0e", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {DAY_LABEL[d] ?? d}
          </span>
        ))}
        {app.preferredTimes.map((t: string) => (
          <span
            key={t}
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#0e0e0e", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {TIME_LABEL[t] ?? t}
          </span>
        ))}
      </div>

      {/* 관리자 메모 */}
      {app.adminNote && (
        <div
          className="mx-4 mb-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(47,107,255,0.06)", border: "1px solid rgba(47,107,255,0.12)" }}
        >
          <p className="text-[11px] font-semibold mb-0.5" style={{ color: "#2F6BFF" }}>관리자 메모</p>
          <p className="text-[12px] leading-relaxed" style={{ color: "#a0a0a0" }}>{app.adminNote}</p>
        </div>
      )}

      {/* 하단: 시간 + 버튼 */}
      <div className="flex items-center justify-between px-4 pb-3.5">
        <p className="text-[11px]" style={{ color: "#3a3a3a" }}>
          {timeAgoLabel(app.createdMinutesAgo)} 신청
        </p>
        {canWriteReview ? (
          <Link
            href={`/my/review/${app.trainerId}`}
            className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-xl transition-opacity active:opacity-70"
            style={{
              background: hasReview ? "rgba(52,211,153,0.10)" : "rgba(201,169,110,0.12)",
              color:      hasReview ? "#34d399"               : "#c9a96e",
            }}
          >
            <StarIcon />
            {hasReview ? "후기 수정" : "후기 작성"}
          </Link>
        ) : (
          <Link
            href={`/trainer/${app.trainerId}`}
            className="flex items-center gap-0.5 text-[12px] font-medium transition-opacity active:opacity-70"
            style={{ color: "#3a3a3a" }}
          >
            트레이너 보기 <ChevronRight />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyState({ tab }: { tab: TabId }) {
  const msg: Record<TabId, string> = {
    all:       "신청 내역이 없습니다.",
    received:  "접수된 신청이 없습니다.",
    confirmed: "확정된 신청이 없습니다.",
    completed: "완료된 신청이 없습니다.",
    cancelled: "취소된 신청이 없습니다.",
  };
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <ClipboardEmpty />
      <div className="text-center">
        <p className="text-[14px] font-medium mb-1" style={{ color: "rgba(255,255,255,0.06)" }}>
          {msg[tab]}
        </p>
        {tab === "all" && (
          <p className="text-[12.5px]" style={{ color: "#131313" }}>
            트레이너를 찾아 OT를 신청해보세요.
          </p>
        )}
      </div>
      {tab === "all" && (
        <Link
          href="/"
          className="mt-1 px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-opacity active:opacity-80"
          style={{ background: "linear-gradient(135deg, #2F6BFF 0%, #1a55d4 100%)", color: "#fff" }}
        >
          트레이너 찾기
        </Link>
      )}
    </div>
  );
}

/* ── 페이지 ── */
export default function MyApplicationsPage() {
  const router = useRouter();
  const [apps, setApps]                         = useState<Application[]>([]);
  const [reviewedTrainerIds, setReviewedIds]     = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab]               = useState<TabId>("all");

  useEffect(() => {
    const phone = localStorage.getItem("jg_my_phone");
    if (!phone) { router.replace("/my"); return; }
    Promise.all([getApplicationsByPhone(phone), getReviewsByPhone(phone)]).then(([appsData, reviews]) => {
      setApps(appsData);
      setReviewedIds(new Set(reviews.map((r) => r.trainerId)));
    });
  }, [router]);

  const filtered = apps.filter((a: Application) => {
    if (activeTab === "all") return true;
    if (activeTab === "received") return ["pending","received","checking","contact_scheduled","scheduling"].includes(a.status);
    return a.status === activeTab;
  });

  const counts: Record<TabId, number> = {
    all:       apps.length,
    received:  apps.filter((a) => a.status === "received" || a.status === "pending" || a.status === "checking" || a.status === "contact_scheduled" || a.status === "scheduling").length,
    confirmed: apps.filter((a) => a.status === "confirmed").length,
    completed: apps.filter((a) => a.status === "completed").length,
    cancelled: apps.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(14,14,14,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="px-4 pt-5 pb-3">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
            style={{ color: "#2F6BFF" }}>MY</p>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>
            내 신청 내역
          </h1>
        </div>

        {/* 탭 */}
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
                  background: isActive ? "#1a55d4" : "#1a1a1a",
                  color:      isActive ? "#fff"    : "#5a5a5a",
                  border:     `1.5px solid ${isActive ? "#1a55d4" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {tab.label}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#131313",
                    color:      isActive ? "#fff" : "#5a5a5a",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── 목록 ── */}
      <main className="page-scroll px-4 pt-3">
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((app: Application) => (
              <AppCard key={app.id} app={app} reviewedTrainerIds={reviewedTrainerIds} />
            ))}
            <p className="text-center text-[12px] py-4" style={{ color: "#131313" }}>
              — 모두 확인했습니다 —
            </p>
          </div>
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </main>

      <BottomNav />
    </div>
  );
}

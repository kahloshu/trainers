"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { REVIEWS, TRAINERS, type Review } from "@/app/data/trainers";
import AdminBottomNav from "@/app/admin/components/AdminBottomNav";

/* ── 타입 확장 (is_visible 로컬 상태용) ── */
type ReviewWithVisibility = Review & { isVisible: boolean };

/* ── 탭 정의 ── */
const TABS = [
  { id: "all",     label: "전체"   },
  { id: "visible", label: "공개 중" },
  { id: "hidden",  label: "비공개" },
  { id: "noted",   label: "비공개 메모" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ── 아이콘 ── */
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#34d399" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="#34d399" strokeWidth="1.6" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="#a0a0a0" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="#a0a0a0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#f59e0b" strokeWidth="1.6" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── 별점 ── */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= rating ? "#c9a96e" : "#131313"}
          />
        </svg>
      ))}
      <span className="ml-1 text-[11.5px] font-semibold" style={{ color: "#c9a96e" }}>
        {rating}.0
      </span>
    </div>
  );
}

/* ── 날짜 레이블 ── */
function daysLabel(daysAgo: number): string {
  if (daysAgo === 0) return "오늘";
  if (daysAgo < 7)  return `${daysAgo}일 전`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}주 전`;
  return `${Math.floor(daysAgo / 30)}개월 전`;
}

/* ── 후기 카드 ── */
function ReviewCard({
  review,
  trainerName,
  onToggle,
}: {
  review: ReviewWithVisibility;
  trainerName: string;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-opacity"
      style={{
        background: "#1a1a1a",
        borderColor: review.isVisible ? "rgba(255,255,255,0.04)" : "#262626",
        opacity: review.isVisible ? 1 : 0.7,
      }}
    >
      <div className="p-4 flex flex-col gap-2.5">

        {/* 1행: 별점 + 날짜 */}
        <div className="flex items-center justify-between">
          <StarRow rating={review.rating} />
          <span className="text-[11px]" style={{ color: "#3a3a3a" }}>
            {daysLabel(review.daysAgo)}
          </span>
        </div>

        {/* 2행: 공개 후기 */}
        <p
          className="text-[13.5px] leading-relaxed"
          style={{ color: review.isVisible ? "#c0c0c0" : "#5a5a5a" }}
        >
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* 3행: 작성자 + 트레이너 */}
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: "#5a5a5a" }}>
            {review.authorMasked}
          </span>
          <span className="text-[12px]" style={{ color: "#3a3a3a" }}>
            {trainerName} 트레이너
          </span>
        </div>

        {/* 비공개 메모 인디케이터 */}
        {/* (실제 adminNote는 Review 타입에 없으므로 샘플로 일부만 표시) */}
        {review.rating <= 3 && (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <LockIcon />
            <span className="text-[11.5px]" style={{ color: "#d97706" }}>
              비공개 메모 있음
            </span>
          </div>
        )}

        {/* 비공개 처리 안내 */}
        {!review.isVisible && (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: "rgba(90,90,90,0.08)", border: "1px solid rgba(90,90,90,0.15)" }}
          >
            <EyeOffIcon />
            <span className="text-[11.5px]" style={{ color: "#5a5a5a" }}>
              비공개 처리됨 — 트레이너 페이지에서 숨겨집니다.
            </span>
          </div>
        )}
      </div>

      {/* 카드 하단 액션 */}
      <div className="flex border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {/* 공개/비공개 토글 */}
        <button
          onClick={() => onToggle(review.id)}
          className="flex-1 py-3 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold transition-opacity active:opacity-70"
          style={{ color: review.isVisible ? "#a0a0a0" : "#34d399" }}
        >
          {review.isVisible ? (
            <><EyeOffIcon /><span>비공개 처리</span></>
          ) : (
            <><EyeIcon /><span>공개 복원</span></>
          )}
        </button>

        {/* 구분 */}
        <div className="w-px" style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* 상세 보기 */}
        <Link
          href={`/admin/reviews/${review.id}`}
          className="flex items-center justify-center gap-1 px-5 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
          style={{ color: "#a0a0a0" }}
        >
          상세보기 <ChevronRight />
        </Link>
      </div>
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyState({ tab }: { tab: TabId }) {
  const msg: Record<TabId, string> = {
    all:     "등록된 후기가 없습니다.",
    visible: "공개 중인 후기가 없습니다.",
    hidden:  "비공개 처리된 후기가 없습니다.",
    noted:   "비공개 메모가 있는 후기가 없습니다.",
  };
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: "rgba(201,169,110,0.08)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="none" stroke="#3a3a3a" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[13px]" style={{ color: "#3a3a3a" }}>{msg[tab]}</p>
    </div>
  );
}

/* ── 페이지 ── */
export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  /* isVisible 상태를 로컬로 관리 */
  const [reviews, setReviews] = useState<ReviewWithVisibility[]>(
    REVIEWS.map((r) => ({ ...r, isVisible: true }))
  );

  /* 탭별 카운트 */
  const counts = useMemo(() => ({
    all:     reviews.length,
    visible: reviews.filter((r) => r.isVisible).length,
    hidden:  reviews.filter((r) => !r.isVisible).length,
    noted:   reviews.filter((r) => r.rating <= 3).length,
  }), [reviews]);

  /* 필터 */
  const filtered = useMemo(() => {
    if (activeTab === "all")     return reviews;
    if (activeTab === "visible") return reviews.filter((r) => r.isVisible);
    if (activeTab === "hidden")  return reviews.filter((r) => !r.isVisible);
    if (activeTab === "noted")   return reviews.filter((r) => r.rating <= 3);
    return reviews;
  }, [reviews, activeTab]);

  /* 공개/비공개 토글 */
  function toggleVisibility(id: string) {
    setReviews((prev) =>
      prev.map((r) => r.id === id ? { ...r, isVisible: !r.isVisible } : r)
    );
  }

  /* 트레이너명 조회 */
  function getTrainerName(trainerId: string) {
    return TRAINERS.find((t) => t.id === trainerId)?.name ?? "—";
  }

  /* 평균 평점 */
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

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
              후기 관리
            </h1>
          </div>

          {/* 평균 평점 */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#c9a96e" />
            </svg>
            <span className="text-[12px] font-semibold" style={{ color: "#c9a96e" }}>
              평균 {avgRating}
            </span>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count    = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150"
                style={{
                  background: isActive ? "#156aff" : "#1a1a1a",
                  color:      isActive ? "#fff"    : "#5a5a5a",
                  border:     `1.5px solid ${isActive ? "#156aff" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.2)" : tab.id === "noted" ? "rgba(245,158,11,0.15)" : "#131313",
                      color:      isActive ? "#fff" : tab.id === "noted" ? "#d97706" : "#5a5a5a",
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

        {/* 결과 수 + 공개 현황 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px]" style={{ color: "#3a3a3a" }}>
            {filtered.length}건
          </p>
          <p className="text-[11.5px]" style={{ color: "#3a3a3a" }}>
            공개 {counts.visible} · 비공개 {counts.hidden}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                trainerName={getTrainerName(review.trainerId)}
                onToggle={toggleVisibility}
              />
            ))}
            <p className="text-center text-[12px] py-4" style={{ color: "rgba(255,255,255,0.06)" }}>
              — 모두 확인했습니다 —
            </p>
          </div>
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </main>

      <AdminBottomNav />
    </div>
  );
}

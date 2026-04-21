"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllApplications,
  STATUS_LABEL,
  DAY_LABEL,
  TIME_LABEL,
  timeAgoLabel,
  type Application,
  type AppStatus,
} from "@/app/data/applications";
import { getAllReviews, type Review } from "@/app/data/trainers";
import AdminBottomNav from "@/app/admin/components/AdminBottomNav";

/* ── 날짜 ── */
function todayLabel() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });
}

/* ── 상태 뱃지 색상 ── */
const STATUS_COLOR: Record<AppStatus, { bg: string; text: string; dot: string }> = {
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
function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M13 6L19 12L13 18" stroke="#3a3a3a" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarFilled({ color = "#c9a96e" }: { color?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
    </svg>
  );
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ── 통계 카드 ── */
function StatCard({
  label, count, color, sub, href,
}: {
  label: string; count: number; color: string; sub?: string; href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col justify-between p-4 rounded-2xl border transition-opacity active:opacity-70"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}
    >
      <span className="text-[11px] font-medium" style={{ color: "#5a5a5a" }}>{label}</span>
      <div className="mt-3">
        <span className="text-[32px] font-bold leading-none tracking-tight" style={{ color }}>
          {count}
        </span>
        {sub && (
          <span className="text-[11px] ml-1.5" style={{ color: "#3a3a3a" }}>{sub}</span>
        )}
      </div>
    </Link>
  );
}

/* ── 최근 신청 카드 ── */
function RecentAppCard({ app }: { app: Application }) {
  const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");

  return (
    <Link
      href={`/admin/applications/${app.id}`}
      className="flex flex-col gap-2.5 p-4 rounded-2xl border transition-opacity active:opacity-70"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>
            {app.applicantName}
          </span>
          <StatusBadge status={app.status} />
        </div>
        <span className="text-[11px] flex-shrink-0" style={{ color: "#3a3a3a" }}>
          {timeAgoLabel(app.createdMinutesAgo)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="#3a3a3a" strokeWidth="1.6" />
          <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
            stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="text-[12.5px]" style={{ color: "#a0a0a0" }}>
          {app.trainerName} 트레이너
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12px]" style={{ color: "#5a5a5a" }}>
          {days}
          <span className="mx-1.5" style={{ color: "rgba(255,255,255,0.06)" }}>·</span>
          {times}
        </span>
      </div>

      {app.adminNote && (
        <div
          className="flex items-start gap-1.5 px-2.5 py-2 rounded-xl"
          style={{ background: "rgba(47,107,255,0.06)", border: "1px solid rgba(47,107,255,0.10)" }}
        >
          <svg className="flex-shrink-0 mt-0.5" width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
              stroke="#2F6BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[11px] leading-snug line-clamp-1" style={{ color: "#5a5a5a" }}>
            {app.adminNote}
          </span>
        </div>
      )}
    </Link>
  );
}

/* ── 최근 후기 카드 ── */
function RecentReviewCard({ review }: { review: Review }) {
  const daysLabel = review.daysAgo === 0 ? "오늘"
    : review.daysAgo < 7 ? `${review.daysAgo}일 전`
    : `${Math.floor(review.daysAgo / 7)}주 전`;

  return (
    <Link
      href={`/admin/reviews/${review.id}`}
      className="flex flex-col gap-2 p-4 rounded-2xl border transition-opacity active:opacity-70"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <StarFilled key={i} color={i <= review.rating ? "#c9a96e" : "#131313"} />
          ))}
          <span className="ml-1 text-[12px] font-semibold" style={{ color: "#c9a96e" }}>
            {review.rating}.0
          </span>
        </div>
        <span className="text-[11px]" style={{ color: "#3a3a3a" }}>{daysLabel}</span>
      </div>
      <p className="text-[13px] leading-snug line-clamp-1 italic" style={{ color: "#a0a0a0" }}>
        &ldquo;{review.comment}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px]" style={{ color: "#5a5a5a" }}>
          {review.authorMasked}
        </span>
      </div>
    </Link>
  );
}

/* ── 섹션 헤더 ── */
function SectionHeader({ title, href, count }: { title: string; href: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>{title}</h2>
        {count !== undefined && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}
          >
            {count}
          </span>
        )}
      </div>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-[12px] font-medium transition-opacity active:opacity-70"
        style={{ color: "#5a5a5a" }}
      >
        전체 보기 <ChevronRight />
      </Link>
    </div>
  );
}

/* ── 페이지 ── */
export default function AdminHomePage() {
  const [apps, setApps]       = useState<Application[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getAllApplications().then(setApps);
    getAllReviews().then(setReviews);
  }, []);

  const stats = {
    total:     apps.length,
    pending:   apps.filter((a) => a.status === "pending").length,
    confirmed: apps.filter((a) => a.status === "confirmed").length,
    completed: apps.filter((a) => a.status === "completed").length,
  };

  const recentApps    = apps.filter((a) => a.status === "pending").slice(0, 3);
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40 px-4 pt-5 pb-4"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#2F6BFF" }}>
              James Gym
            </p>
            <h1 className="text-[20px] font-bold tracking-tight leading-tight" style={{ color: "#ffffff" }}>
              관리자 대시보드
            </h1>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
            style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF", border: "1px solid rgba(47,107,255,0.2)" }}
          >
            관
          </div>
        </div>
        <p className="text-[12px] mt-1" style={{ color: "#3a3a3a" }}>{todayLabel()}</p>
      </header>

      <main className="page-scroll">

        {/* ── 처리 필요 배너 ── */}
        {stats.pending > 0 && (
          <Link
            href="/admin/applications"
            className="mx-4 mt-4 flex items-center justify-between px-4 py-3 rounded-2xl transition-opacity active:opacity-70"
            style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f87171" }} />
              <span className="text-[13px] font-semibold" style={{ color: "#f87171" }}>
                처리 필요한 신청 {stats.pending}건
              </span>
            </div>
            <ArrowRight />
          </Link>
        )}

        {/* ── 통계 그리드 ── */}
        <div className="px-4 mt-4">
          <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
            현황 요약
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="신규 신청"  count={stats.pending}   color="#f87171" sub="건" href="/admin/applications?status=pending" />
            <StatCard label="확정 대기"  count={stats.confirmed} color="#fbbf24" sub="건" href="/admin/applications?status=confirmed" />
            <StatCard label="완료"       count={stats.completed} color="#34d399" sub="건" href="/admin/applications?status=completed" />
            <StatCard label="전체 신청"  count={stats.total}     color="#a0a0a0" sub="건" href="/admin/applications" />
          </div>
        </div>

        {/* ── 최근 신청 ── */}
        <div className="mt-6">
          <SectionHeader title="최근 신청" href="/admin/applications" count={stats.pending} />
          <div className="flex flex-col gap-2.5 px-4">
            {recentApps.length > 0 ? (
              recentApps.map((app) => <RecentAppCard key={app.id} app={app} />)
            ) : (
              <div
                className="py-8 text-center rounded-2xl"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <p className="text-[13px]" style={{ color: "#3a3a3a" }}>
                  처리 대기 중인 신청이 없습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── 최근 후기 ── */}
        <div className="mt-6">
          <SectionHeader title="최근 후기" href="/admin/reviews" count={recentReviews.length} />
          <div className="flex flex-col gap-2.5 px-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => <RecentReviewCard key={review.id} review={review} />)
            ) : (
              <div
                className="py-8 text-center rounded-2xl"
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <p className="text-[13px]" style={{ color: "#3a3a3a" }}>등록된 후기가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── 빠른 메뉴 ── */}
        <div className="mt-6 px-4">
          <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
            빠른 이동
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "신청 관리",     sub: "상태 변경 · 메모", href: "/admin/applications", icon: "📋" },
              { label: "후기 관리",     sub: "공개 · 비공개",    href: "/admin/reviews",      icon: "⭐" },
              { label: "트레이너 관리", sub: "등록 · 수정",      href: "/admin/trainers",     icon: "👤" },
              { label: "더보기",        sub: "설정 · 계정",      href: "/admin/more",         icon: "···" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-1.5 p-4 rounded-2xl border transition-opacity active:opacity-70"
                style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[13.5px] font-semibold" style={{ color: "#ffffff" }}>{item.label}</span>
                <span className="text-[11px]" style={{ color: "#5a5a5a" }}>{item.sub}</span>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <AdminBottomNav />
    </div>
  );
}

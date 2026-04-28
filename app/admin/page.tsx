"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTrainer } from "./layout";
import {
  STATUS_LABEL, DAY_LABEL, TIME_LABEL, timeAgoLabel,
  type Application, type AppStatus,
} from "@/app/data/applications";
import type { Review } from "@/app/data/trainers";

/* ── 날짜 ── */
function todayLabel() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });
}

/* ── 상태 색상 ── */
const STATUS_COLOR: Record<AppStatus, { bg: string; text: string; dot: string }> = {
  pending:           { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", dot: "#60a5fa" },
  received:          { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", dot: "#60a5fa" },
  checking:          { bg: "rgba(251,191,36,0.10)",  text: "#fbbf24", dot: "#fbbf24" },
  contact_scheduled: { bg: "rgba(167,139,250,0.10)", text: "#a78bfa", dot: "#a78bfa" },
  scheduling:        { bg: "rgba(251,146,60,0.10)",  text: "#fb923c", dot: "#fb923c" },
  confirmed:         { bg: "rgba(234,179,8,0.10)",   text: "#fbbf24", dot: "#eab308" },
  completed:         { bg: "rgba(52,211,153,0.10)",  text: "var(--success)", dot: "#10b981" },
  cancelled:         { bg: "rgba(90,90,90,0.10)",    text: "var(--text-secondary)", dot: "var(--text-muted)" },
};

function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

function StarFilled({ color = "var(--gold)" }: { color?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="var(--text-dim)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHeader({ title, href, count }: { title: string; href: string; count?: number }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--accent-subtle-hi)", color: "var(--accent)" }}>
            {count}
          </span>
        )}
      </div>
      <Link href={href} className="flex items-center gap-0.5 text-[12px] font-medium"
        style={{ color: "var(--text-muted)" }}>
        전체 보기 <ChevronRight />
      </Link>
    </div>
  );
}

/* ── 신청 카드 ── */
function RecentAppCard({ app }: { app: Application }) {
  const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");
  return (
    <Link href={`/admin/applications/${app.id}`}
      className="flex flex-col gap-2.5 p-4 rounded-2xl border transition-opacity active:opacity-70"
      style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {app.applicantName}
          </span>
          <StatusBadge status={app.status} />
        </div>
        <span className="text-[11px] flex-shrink-0" style={{ color: "var(--text-dim)" }}>
          {timeAgoLabel(app.createdMinutesAgo)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
          {days}{times && <span className="mx-1.5" style={{ color: "var(--border)" }}>·</span>}{times}
        </span>
      </div>
      {app.userMessage && (
        <p className="text-[11.5px] leading-snug line-clamp-1 italic" style={{ color: "var(--text-muted)" }}>
          &ldquo;{app.userMessage}&rdquo;
        </p>
      )}
    </Link>
  );
}

/* ── 후기 카드 ── */
function RecentReviewCard({ review }: { review: Review }) {
  const label = review.daysAgo === 0 ? "오늘"
    : review.daysAgo < 7 ? `${review.daysAgo}일 전`
    : `${Math.floor(review.daysAgo / 7)}주 전`;
  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl border"
      style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((i) => (
            <StarFilled key={i} color={i <= review.rating ? "var(--gold)" : "var(--bg-2)"} />
          ))}
          <span className="ml-1 text-[12px] font-semibold" style={{ color: "var(--gold)" }}>
            {review.rating}.0
          </span>
        </div>
        <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>{label}</span>
      </div>
      <p className="text-[13px] leading-snug line-clamp-2 italic" style={{ color: "var(--text-secondary)" }}>
        &ldquo;{review.comment}&rdquo;
      </p>
      <span className="text-[11.5px]" style={{ color: "var(--text-muted)" }}>{review.authorMasked}</span>
    </div>
  );
}

/* ── 페이지 ── */
export default function TrainerHomePage() {
  const trainer = useTrainer();
  const [apps, setApps]       = useState<Application[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats]     = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });

  useEffect(() => {
    fetch("/api/trainer/applications")
      .then((r) => r.json())
      .then((d) => setApps(d.applications ?? []));

    fetch("/api/trainer/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []));

    fetch("/api/trainer/stats")
      .then((r) => r.json())
      .then((d) => setStats(d));
  }, []);

  const recentApps    = apps.slice(0, 5);
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="min-h-dvh pb-24" style={{ background: "var(--bg)" }}>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 px-4 pt-5 pb-4"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "var(--accent)" }}>
              James Gym
            </p>
            <h1 className="text-[20px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
              {trainer ? `${trainer.trainerName} 트레이너` : "내 대시보드"}
            </h1>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0"
            style={{ background: "var(--accent-subtle-hi)", color: "var(--accent)", border: "1px solid rgba(47,107,255,0.2)" }}>
            {trainer?.trainerName?.charAt(0) ?? "T"}
          </div>
        </div>
        <p className="text-[12px] mt-1" style={{ color: "var(--text-dim)" }}>{todayLabel()}</p>
      </header>

      <main>
        {/* 신규 신청 배너 */}
        {stats.pending > 0 && (
          <Link href="/admin/applications"
            className="mx-4 mt-4 flex items-center justify-between px-4 py-3 rounded-2xl transition-opacity active:opacity-70"
            style={{ background: "var(--accent-glow)", border: "1px solid rgba(47,107,255,0.16)" }}>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              <span className="text-[13px] font-semibold" style={{ color: "#60a5fa" }}>
                새로운 신청 {stats.pending}건이 있습니다
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}

        {/* 통계 */}
        <div className="px-4 mt-4">
          <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--text-dim)" }}>
            내 신청 현황
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "신규·진행 중", count: stats.pending,   color: "#60a5fa", href: "/admin/applications" },
              { label: "확정됨",       count: stats.confirmed, color: "#fbbf24", href: "/admin/applications" },
              { label: "완료",         count: stats.completed, color: "var(--success)", href: "/admin/applications" },
              { label: "전체 신청",    count: stats.total,     color: "var(--text-secondary)", href: "/admin/applications" },
            ].map(({ label, count, color, href }) => (
              <Link key={label} href={href}
                className="flex flex-col justify-between p-4 rounded-2xl border transition-opacity active:opacity-70"
                style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}>
                <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="text-[32px] font-bold leading-none tracking-tight mt-3" style={{ color }}>
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 최근 신청 */}
        <div className="mt-6">
          <SectionHeader title="최근 신청" href="/admin/applications" count={recentApps.length} />
          <div className="flex flex-col gap-2.5 px-4">
            {recentApps.length > 0 ? (
              recentApps.map((app) => <RecentAppCard key={app.id} app={app} />)
            ) : (
              <div className="py-8 text-center rounded-2xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-[13px]" style={{ color: "var(--text-dim)" }}>아직 신청이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 최근 후기 */}
        <div className="mt-6">
          <SectionHeader title="최근 후기" href="/admin/reviews" count={recentReviews.length} />
          <div className="flex flex-col gap-2.5 px-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((r) => <RecentReviewCard key={r.id} review={r} />)
            ) : (
              <div className="py-8 text-center rounded-2xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}>
                <p className="text-[13px]" style={{ color: "var(--text-dim)" }}>아직 후기가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

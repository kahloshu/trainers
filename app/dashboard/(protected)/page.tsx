"use client";

import { useState, useEffect } from "react";
import { getAllApplications, type Application } from "@/app/data/applications";
import { getAllTrainers, type Trainer } from "@/app/data/trainers";

/* ── 아이콘 ── */
function TrendUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 통계 카드 ── */
function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium" style={{ color: "var(--dash-text-muted)" }}>{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color + "18", color }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[28px] font-bold leading-none" style={{ color: "var(--dash-text)" }}>
          {value}
        </p>
        {sub && (
          <p className="text-[12px] mt-1.5" style={{ color: "var(--dash-text-dimmed)" }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ── 최근 신청 행 ── */
const STATUS_COLOR: Record<string, { text: string; bg: string }> = {
  pending:   { text: "#f87171", bg: "rgba(248,113,113,0.10)" },
  confirmed: { text: "#fbbf24", bg: "rgba(234,179,8,0.10)" },
  completed: { text: "#34d399", bg: "rgba(52,211,153,0.10)" },
  cancelled: { text: "#5a5a5a", bg: "rgba(90,90,90,0.10)" },
};
const STATUS_KO: Record<string, string> = {
  pending: "대기", confirmed: "확정", completed: "완료", cancelled: "취소",
};

function RecentRow({ app }: { app: Application }) {
  const sc = STATUS_COLOR[app.status];
  return (
    <div
      className="flex items-center justify-between py-3.5 px-5"
      style={{ borderBottom: "1px solid var(--dash-border-xs)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
          style={{ background: "var(--dash-avatar-bg)", color: "#8eabff" }}
        >
          {app.applicantName.charAt(0)}
        </div>
        <div>
          <p className="text-[13.5px] font-medium" style={{ color: "var(--dash-text)" }}>
            {app.applicantName}
          </p>
          <p className="text-[11.5px]" style={{ color: "var(--dash-text-dimmed)" }}>
            {app.trainerName} 트레이너
          </p>
        </div>
      </div>
      <span
        className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full"
        style={{ background: sc.bg, color: sc.text }}
      >
        {STATUS_KO[app.status]}
      </span>
    </div>
  );
}

/* ── 페이지 ── */
export default function DashboardPage() {
  const [apps, setApps]         = useState<Application[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAllApplications(), getAllTrainers()]).then(([a, t]) => {
      setApps(a);
      setTrainers(t);
      setLoading(false);
    });
  }, []);

  const pending   = apps.filter((a) => a.status === "pending").length;
  const confirmed = apps.filter((a) => a.status === "confirmed").length;
  const recent    = apps.slice(0, 8);

  return (
    <div className="p-6 max-w-[1200px]">

      {/* 페이지 제목 */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold" style={{ color: "var(--dash-text)" }}>개요</h2>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--dash-text-dimmed)" }}>전체 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 그리드 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: "var(--dash-card)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
          <StatCard
            label="전체 신청"
            value={apps.length}
            sub="누적 OT 신청 건"
            icon={<TrendUpIcon />}
            color="#8eabff"
          />
          <StatCard
            label="대기 중"
            value={pending}
            sub="응답 필요"
            icon={<ClockIcon />}
            color="#f87171"
          />
          <StatCard
            label="확정됨"
            value={confirmed}
            sub="일정 조율 중"
            icon={<CheckIcon />}
            color="#fbbf24"
          />
          <StatCard
            label="등록 트레이너"
            value={trainers.length}
            sub={`상위 노출 ${trainers.filter((t) => t.featured).length}명`}
            icon={<PersonIcon />}
            color="#34d399"
          />
        </div>
      )}

      {/* 최근 신청 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--dash-border-sm)" }}
        >
          <p className="text-[14px] font-semibold" style={{ color: "var(--dash-text)" }}>최근 신청</p>
          <a
            href="/dashboard/applications"
            className="text-[12px] font-medium"
            style={{ color: "#8eabff" }}
          >
            전체 보기
          </a>
        </div>

        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--dash-surface)" }} />
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div>
            {recent.map((a) => <RecentRow key={a.id} app={a} />)}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-[13px]" style={{ color: "var(--dash-text-dimmed)" }}>아직 신청이 없습니다.</p>
          </div>
        )}
      </div>

    </div>
  );
}

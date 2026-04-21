"use client";

import { useState, useEffect } from "react";
import { getAllApplications, type Application } from "@/app/data/applications";
import { getAllTrainers, type Trainer } from "@/app/data/trainers";


/* ── 통계 카드 ── */
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="dash-card-el flex-1 px-5 py-4 rounded-xl"
      style={{ background: "var(--dash-card)", minWidth: 0 }}>
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
        style={{ color: "var(--dash-text-dimmed)" }}>{label}</p>
      <p className="text-[28px] font-bold leading-none mb-1" style={{ color: "var(--dash-text)" }}>
        {value}
      </p>
      {sub && (
        <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>{sub}</p>
      )}
    </div>
  );
}

/* ── 최근 신청 행 ── */
const STATUS_COLOR: Record<string, { text: string; bg: string }> = {
  pending:           { text: "#60a5fa", bg: "rgba(96,165,250,0.10)"  },
  received:          { text: "#60a5fa", bg: "rgba(96,165,250,0.10)"  },
  checking:          { text: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  contact_scheduled: { text: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
  scheduling:        { text: "#fb923c", bg: "rgba(251,146,60,0.10)"  },
  confirmed:         { text: "#fbbf24", bg: "rgba(234,179,8,0.10)"   },
  completed:         { text: "#34d399", bg: "rgba(52,211,153,0.10)"  },
  cancelled:         { text: "#5a5a5a", bg: "rgba(90,90,90,0.10)"    },
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
          style={{ background: "var(--dash-avatar-bg)", color: "#2F6BFF" }}
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
    <div className="p-8">

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-[28px] font-black tracking-tight uppercase mb-1.5"
            style={{ color: "var(--dash-text)" }}>개요</h2>
          <p className="text-[13px] max-w-[420px] leading-relaxed"
            style={{ color: "var(--dash-text-sub)" }}>전체 현황을 한눈에 확인하세요.</p>
        </div>
      </div>

      {/* 통계 카드 */}
      {loading ? (
        <div className="flex gap-4 mb-8">
          {[1,2,3,4].map((i) => (
            <div key={i} className="flex-1 h-20 rounded-xl animate-pulse" style={{ background: "var(--dash-card)" }} />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 mb-8">
          <StatCard label="전체 신청"    value={apps.length}     sub="누적 OT 신청 건" />
          <StatCard label="대기 중"      value={pending}         sub="응답 필요" />
          <StatCard label="확정됨"       value={confirmed}       sub="일정 조율 중" />
          <StatCard label="등록 트레이너" value={trainers.length} sub={`상위 노출 ${trainers.filter((t) => t.featured).length}명`} />
        </div>
      )}

      {/* 최근 신청 */}
      <div
        className="dash-card-el rounded-2xl overflow-hidden"
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
            style={{ color: "#2F6BFF" }}
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

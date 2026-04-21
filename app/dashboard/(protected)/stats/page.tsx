"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import { getAllApplications, type Application, type AppStatus } from "@/app/data/applications";
import { getAllTrainers, type Trainer } from "@/app/data/trainers";
import { useTheme } from "@/app/dashboard/ThemeContext";

/* ── 공통 차트 색 (테마 무관) ── */
const C = {
  blue:   "#2F6BFF",
  green:  "#34d399",
  yellow: "#fbbf24",
  red:    "#f87171",
};

/* ─────────────────────── 유틸 ─────────────────────── */

/** ISO → "YYYY-MM-DD" */
function toDay(iso: string) { return iso.slice(0, 10); }

/** 최근 N일 날짜 배열 생성 */
function lastNDays(n: number): string[] {
  const result: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

/** "YYYY-MM-DD" → "M/D" */
function fmtDay(s: string) {
  const [, m, d] = s.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/* ─────────────────────── 서브 컴포넌트 ─────────────────────── */


/** 섹션 카드 래퍼 */
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="dash-card-el rounded-2xl overflow-hidden"
      style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--dash-border)" }}>
        <p className="text-[14px] font-semibold" style={{ color: "var(--dash-text)" }}>{title}</p>
        {sub && <p className="text-[12px] mt-0.5" style={{ color: "var(--dash-text-dimmed)" }}>{sub}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/** 기간 선택 탭 */
function PeriodTab({
  value, options, onChange,
}: {
  value: number;
  options: { label: string; value: number }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="px-3 py-1 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: value === o.value ? "rgba(47,107,255,0.12)" : "transparent",
            color:      value === o.value ? C.blue : "var(--dash-text-dimmed)",
            border:     `1px solid ${value === o.value ? "rgba(47,107,255,0.25)" : "transparent"}`,
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────── 페이지 ─────────────────────── */

const STATUS_KO: Record<AppStatus, string> = {
  pending: "대기", received: "접수", checking: "확인중",
  contact_scheduled: "연락예정", scheduling: "일정조율",
  confirmed: "확정", completed: "완료", cancelled: "취소",
};
const DAY_KO: Record<string, string> = { weekday: "평일", saturday: "토요일", sunday: "일요일" };
const TIME_KO: Record<string, string> = { morning: "오전", afternoon: "오후", evening: "저녁" };

const PERIOD_OPTIONS = [
  { label: "7일",  value: 7  },
  { label: "30일", value: 30 },
  { label: "90일", value: 90 },
];

export default function StatsPage() {
  const [apps, setApps]         = useState<Application[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [period, setPeriod]     = useState(30);
  const { theme } = useTheme();
  const isDark = theme !== "light";

  /* 테마 기반 차트 색상 */
  const chartColors = {
    grid:    isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
    tick:    isDark ? "#3a3a3a" : "#9ca3af",
    tick2:   isDark ? "#a0a0a0" : "#6b7280",
    muted:   isDark ? "#2a2a2a" : "#9ca3af",
    tooltip: {
      bg:     isDark ? "#1a1a1a" : "#ffffff",
      border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)",
      text:   isDark ? "#d0d0d0" : "#374151",
    },
    cursor:  isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
  };

  const TOOLTIP_STYLE = {
    contentStyle: {
      background: chartColors.tooltip.bg,
      border: `1px solid ${chartColors.tooltip.border}`,
      borderRadius: 12,
      fontSize: 12,
      color: chartColors.tooltip.text,
    },
    itemStyle: { color: chartColors.tooltip.text },
    cursor:    { fill: chartColors.cursor },
  };

  useEffect(() => {
    Promise.all([getAllApplications(), getAllTrainers()]).then(([a, t]) => {
      setApps(a);
      setTrainers(t);
      setLoading(false);
    });
  }, []);

  /* ── KPI 계산 ── */
  const kpi = useMemo(() => {
    const total     = apps.length;
    const pending   = apps.filter((a) => a.status === "pending").length;
    const confirmed = apps.filter((a) => a.status === "confirmed").length;
    const completed = apps.filter((a) => a.status === "completed").length;
    const convRate  = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, pending, confirmed, completed, convRate };
  }, [apps]);

  /* ── 신청 추이 (기간별) ── */
  const trendData = useMemo(() => {
    const days = lastNDays(period);
    const map: Record<string, { total: number; completed: number }> = {};
    days.forEach((d) => { map[d] = { total: 0, completed: 0 }; });
    apps.forEach((a) => {
      const d = toDay(a.createdAt);
      if (map[d]) {
        map[d].total++;
        if (a.status === "completed") map[d].completed++;
      }
    });
    return days.map((d) => ({ date: fmtDay(d), ...map[d] }));
  }, [apps, period]);

  /* ── 트레이너별 현황 ── */
  const trainerData = useMemo(() => {
    return trainers.map((t) => {
      const ta = apps.filter((a) => a.trainerId === t.id);
      return {
        name:  t.name,
        신청:  ta.length,
        확정:  ta.filter((a) => a.status === "confirmed" || a.status === "completed").length,
        완료:  ta.filter((a) => a.status === "completed").length,
      };
    }).sort((a, b) => b.신청 - a.신청);
  }, [apps, trainers]);

  /* ── 요일별 신청 ── */
  const dayData = useMemo(() => {
    const keys = ["weekday", "saturday", "sunday"];
    const map: Record<string, number> = { weekday: 0, saturday: 0, sunday: 0 };
    apps.forEach((a) => {
      a.preferredDays.forEach((d) => { if (map[d] !== undefined) map[d]++; });
    });
    return keys.map((k) => ({ name: DAY_KO[k], value: map[k] }));
  }, [apps]);

  /* ── 시간대별 신청 ── */
  const timeData = useMemo(() => {
    const keys = ["morning", "afternoon", "evening"];
    const map: Record<string, number> = { morning: 0, afternoon: 0, evening: 0 };
    apps.forEach((a) => {
      a.preferredTimes.forEach((t) => { if (map[t] !== undefined) map[t]++; });
    });
    return keys.map((k) => ({ name: TIME_KO[k], value: map[k] }));
  }, [apps]);

  /* ── 상태 분포 ── */
  const statusData = useMemo(() => {
    const map: Record<string, number> = {
      pending: 0, received: 0, checking: 0, contact_scheduled: 0,
      scheduling: 0, confirmed: 0, completed: 0, cancelled: 0,
    };
    apps.forEach((a) => { if (a.status in map) map[a.status]++; });
    const colors: Record<string, string> = {
      pending: C.red, received: "#a78bfa", checking: "#60a5fa",
      contact_scheduled: "#f472b6", scheduling: "#fb923c",
      confirmed: C.yellow, completed: C.green, cancelled: chartColors.muted,
    };
    return (Object.keys(map) as AppStatus[])
      .filter((k) => map[k] > 0)
      .map((k) => ({
        name: STATUS_KO[k], value: map[k], color: colors[k],
      }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps, isDark]);

  /* ── 로딩 스켈레톤 ── */
  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1,2,3,4,5].map((i) => <div key={i} className={`h-24 rounded-2xl${i === 5 ? " col-span-2 md:col-span-1" : ""}`} style={{ background: "var(--dash-card)" }} />)}
        </div>
        {[1,2,3].map((i) => <div key={i} className="h-64 rounded-2xl" style={{ background: "var(--dash-card)" }} />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-5">

      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[28px] font-black tracking-tight uppercase mb-1.5"
            style={{ color: "var(--dash-text)" }}>통계</h2>
          <p className="text-[13px] max-w-[420px] leading-relaxed"
            style={{ color: "var(--dash-text-sub)" }}>신청 추이, 트레이너별 현황, 시간대 분포를 확인하세요.</p>
        </div>
      </div>

      {/* ── KPI 카드 ── */}
      <div className="grid grid-cols-2 md:flex gap-4">
        {[
          { label: "전체 신청", value: kpi.total,          sub: "누적 신청 건수" },
          { label: "대기 중",   value: kpi.pending,        sub: "응답 필요" },
          { label: "확정됨",    value: kpi.confirmed,      sub: "일정 조율 중" },
          { label: "완료",      value: kpi.completed,      sub: "OT 완료" },
          { label: "전환율",    value: `${kpi.convRate}%`, sub: "신청 → 완료 비율" },
        ].map(({ label, value, sub }, idx) => (
          <div key={label}
            className={`dash-card-el flex-1 px-5 py-4 rounded-xl${idx === 4 ? " col-span-2 md:col-span-1" : ""}`}
            style={{ background: "var(--dash-card)", minWidth: 0 }}>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
              style={{ color: "var(--dash-text-dimmed)" }}>{label}</p>
            <p className="text-[28px] font-bold leading-none mb-1" style={{ color: "var(--dash-text)" }}>{value}</p>
            <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── 신청 추이 ── */}
      <Section title="신청 추이" sub="일별 신청 건수 및 완료 건수">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ background: C.blue }} />
              <span className="text-[11px]" style={{ color: "var(--dash-text-muted)" }}>신청</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ background: C.green }} />
              <span className="text-[11px]" style={{ color: "var(--dash-text-muted)" }}>완료</span>
            </div>
          </div>
          <PeriodTab value={period} options={PERIOD_OPTIONS} onChange={setPeriod} />
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue}  stopOpacity={0.25} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green}  stopOpacity={0.2} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false}
              interval={period <= 7 ? 0 : period <= 30 ? 4 : 13} />
            <YAxis tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="total" name="신청" stroke={C.blue} strokeWidth={2}
              fill="url(#gBlue)" dot={false} activeDot={{ r: 4, fill: C.blue }} />
            <Area type="monotone" dataKey="completed" name="완료" stroke={C.green} strokeWidth={2}
              fill="url(#gGreen)" dot={false} activeDot={{ r: 4, fill: C.green }} />
          </AreaChart>
        </ResponsiveContainer>
      </Section>

      {/* ── 트레이너별 현황 ── */}
      <Section title="트레이너별 현황" sub="신청 · 확정 · 완료 건수 비교">
        {trainerData.length === 0 ? (
          <p className="text-[13px] py-8 text-center" style={{ color: "var(--dash-text-dimmed)" }}>데이터 없음</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, trainerData.length * 48)}>
            <BarChart
              data={trainerData}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              barCategoryGap="28%"
              barGap={3}
            >
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: chartColors.tick2 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "var(--dash-text-muted)", paddingTop: 12 }}
                iconType="circle" iconSize={8}
              />
              <Bar dataKey="신청" fill={C.blue}   radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="확정" fill={C.yellow} radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="완료" fill={C.green}  radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── 하단 3열: 요일 / 시간대 / 상태분포 ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* 요일별 */}
        <Section title="요일별 신청" sub="선택된 희망 요일 분포">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.tick2 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "신청 수"]} />
              <Bar dataKey="value" name="신청 수" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {dayData.map((_, i) => (
                  <Cell key={i} fill={[C.blue, C.yellow, C.green][i % 3]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* 수치 보조 */}
          <div className="flex gap-3 mt-3">
            {dayData.map((d, i) => (
              <div key={d.name} className="flex-1 text-center">
                <p className="text-[18px] font-bold" style={{ color: [C.blue, C.yellow, C.green][i % 3] }}>{d.value}</p>
                <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>{d.name}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 시간대별 */}
        <Section title="시간대별 신청" sub="선택된 희망 시간대 분포">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={timeData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.tick2 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.tick }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, "신청 수"]} />
              <Bar dataKey="value" name="신청 수" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {timeData.map((_, i) => (
                  <Cell key={i} fill={[C.yellow, C.blue, C.red][i % 3]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-3">
            {timeData.map((d, i) => (
              <div key={d.name} className="flex-1 text-center">
                <p className="text-[18px] font-bold" style={{ color: [C.yellow, C.blue, C.red][i % 3] }}>{d.value}</p>
                <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>{d.name}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 상태 분포 */}
        <Section title="상태 분포" sub="전체 신청의 현재 상태">
          <div className="flex flex-col gap-3 mt-1">
            {statusData.map((s) => {
              const pct = kpi.total > 0 ? Math.round((s.value / kpi.total) * 100) : 0;
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12.5px]" style={{ color: "var(--dash-text-sub)" }}>{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold" style={{ color: s.color }}>{s.value}</span>
                      <span className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dash-progress-bg)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: s.color, opacity: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 전환율 강조 */}
          <div
            className="mt-5 px-4 py-3.5 rounded-xl flex items-center justify-between"
            style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}
          >
            <div>
              <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>신청 → 완료 전환율</p>
              <p className="text-[22px] font-bold mt-0.5" style={{ color: C.green }}>{kpi.convRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>완료</p>
              <p className="text-[16px] font-semibold" style={{ color: "var(--dash-text)" }}>{kpi.completed} / {kpi.total}</p>
            </div>
          </div>
        </Section>
      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getAllApplications,
  STATUS_LABEL,
  DAY_LABEL,
  TIME_LABEL,
  type Application,
  type AppStatus,
} from "@/app/data/applications";
import DashboardFilter, {
  EMPTY_FILTER,
  applyFilter,
  type FilterState,
} from "../components/DashboardFilter";

/* ── 상태 스타일 ── */
const STATUS_STYLE: Record<AppStatus, { text: string; bg: string }> = {
  pending:           { text: "#60a5fa", bg: "rgba(96,165,250,0.10)"  },
  received:          { text: "#60a5fa", bg: "rgba(96,165,250,0.10)"  },
  checking:          { text: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  contact_scheduled: { text: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
  scheduling:        { text: "#fb923c", bg: "rgba(251,146,60,0.10)"  },
  confirmed:         { text: "#fbbf24", bg: "rgba(234,179,8,0.10)"   },
  completed:         { text: "#34d399", bg: "rgba(52,211,153,0.10)"  },
  cancelled:         { text: "#5a5a5a", bg: "rgba(90,90,90,0.10)"    },
};

const STATUS_CHIPS = [
  { value: "received",          label: "접수됨"    },
  { value: "checking",          label: "확인중"    },
  { value: "contact_scheduled", label: "연락 예정"  },
  { value: "scheduling",        label: "일정 조율중" },
  { value: "confirmed",         label: "확정됨"    },
  { value: "completed",         label: "완료"      },
  { value: "cancelled",         label: "취소됨"    },
];

/* ── 날짜 포맷 ── */
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

/* ── 테이블 헤더 셀 ── */
function Th({ children, width }: { children: React.ReactNode; width?: string }) {
  return (
    <th
      className="text-left px-4 py-3 text-[11.5px] font-semibold tracking-[0.1em] uppercase whitespace-nowrap"
      style={{ color: "var(--dash-text-dimmed)", width }}
    >
      {children}
    </th>
  );
}

/* ── 테이블 바디 셀 ── */
function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-4 py-3.5 text-[13px]" style={{ color: muted ? "var(--dash-text-muted)" : "var(--dash-text-body)" }}>
      {children}
    </td>
  );
}

export default function DashboardApplicationsPage() {
  const router = useRouter();
  const [apps, setApps]   = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterState>(EMPTY_FILTER);

  useEffect(() => {
    getAllApplications().then((list) => {
      setApps(list);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() =>
    applyFilter(apps as unknown as Record<string, unknown>[], filter, {
      searchFields: ["applicantName", "applicantPhone", "trainerName"],
      statusField:  "status",
      dateField:    "createdAt",
    }) as unknown as Application[],
    [apps, filter]
  );

  /* 상태별 카운트 */
  const counts = useMemo(() => ({
    pending:   apps.filter((a) => a.status === "pending").length,
    confirmed: apps.filter((a) => a.status === "confirmed").length,
    completed: apps.filter((a) => a.status === "completed").length,
    cancelled: apps.filter((a) => a.status === "cancelled").length,
  }), [apps]);

  return (
    <div className="p-4 md:p-8">

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-[28px] font-black tracking-tight uppercase mb-1.5"
            style={{ color: "var(--dash-text)" }}>신청 관리</h2>
          <p className="text-[13px] max-w-[420px] leading-relaxed"
            style={{ color: "var(--dash-text-sub)" }}>
            OT 신청 목록을 관리하세요. 상태별로 필터링하고 상세 내용을 확인할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:flex gap-4 mb-8">
        {[
          { label: "전체 신청",   value: apps.length },
          { label: "대기 중",     value: counts.pending },
          { label: "확정됨",      value: counts.confirmed },
          { label: "완료",        value: counts.completed },
        ].map(({ label, value }) => (
          <div key={label} className="dash-card-el flex-1 px-5 py-4 rounded-xl"
            style={{ background: "var(--dash-card)", minWidth: 0 }}>
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
              style={{ color: "var(--dash-text-dimmed)" }}>{label}</p>
            <p className="text-[28px] font-bold leading-none" style={{ color: "var(--dash-text)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div className="mb-4">
        <DashboardFilter
          value={filter}
          onChange={setFilter}
          statusChips={STATUS_CHIPS}
          searchPlaceholder="신청자명, 연락처, 트레이너 검색…"
          showDateRange
        />
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-16 rounded-2xl" style={{ background: "var(--dash-card)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl"
          style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}>
          <p className="text-[14px]" style={{ color: "var(--dash-text-dimmed)" }}>
            {apps.length === 0 ? "신청 내역이 없습니다." : "검색 결과가 없습니다."}
          </p>
        </div>
      ) : (
        <>
          {/* ── 모바일 카드 (md 미만) ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((app) => {
              const s = STATUS_STYLE[app.status];
              const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
              const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");
              return (
                <div key={app.id}
                  onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                  className="rounded-2xl px-4 py-3.5 cursor-pointer active:opacity-70"
                  style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}>
                  {/* 상단: 신청자 + 상태 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: "var(--dash-avatar-bg)", color: "#2F6BFF" }}>
                        {app.applicantName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold leading-tight" style={{ color: "var(--dash-text)" }}>
                          {app.applicantName}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>
                          {app.trainerName} · #{app.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                      style={{ background: s.bg, color: s.text }}>
                      {STATUS_LABEL[app.status]}
                    </span>
                  </div>
                  {/* 운동 목적 태그 */}
                  {app.purposes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {app.purposes.map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: "rgba(47,107,255,0.10)", color: "#2F6BFF" }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* 하단: 일정 + 날짜 */}
                  <div className="flex items-center justify-between">
                    <p className="text-[11.5px]" style={{ color: "var(--dash-text-muted)" }}>
                      {days}{times ? ` / ${times}` : ""}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--dash-text-faint)" }}>
                      {fmtDate(app.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 데스크탑 테이블 (md 이상) ── */}
          <div className="hidden md:block dash-card-el rounded-2xl overflow-hidden"
            style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                    <Th width="120">신청번호</Th>
                    <Th width="120">신청자</Th>
                    <Th width="130">연락처</Th>
                    <Th width="130">트레이너</Th>
                    <Th>운동 목적</Th>
                    <Th>희망 일정</Th>
                    <Th width="100">상태</Th>
                    <Th width="160">신청일시</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => {
                    const s = STATUS_STYLE[app.status];
                    const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
                    const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");
                    return (
                      <tr key={app.id}
                        onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: "1px solid var(--dash-border-xs)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--dash-hover-row)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                      >
                        <Td muted>#{app.id.slice(-6).toUpperCase()}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                              style={{ background: "var(--dash-avatar-bg)", color: "#2F6BFF" }}>
                              {app.applicantName.charAt(0)}
                            </div>
                            {app.applicantName}
                          </div>
                        </Td>
                        <Td muted>{app.applicantPhone}</Td>
                        <Td>{app.trainerName}</Td>
                        <Td>
                          <div className="flex flex-wrap gap-1">
                            {app.purposes.length > 0 ? app.purposes.map((p) => (
                              <span key={p}
                                className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
                                style={{ background: "rgba(47,107,255,0.10)", color: "#2F6BFF" }}>
                                {p}
                              </span>
                            )) : <span style={{ color: "var(--dash-text-faint)" }}>—</span>}
                          </div>
                        </Td>
                        <Td muted>
                          <span>{days}</span>
                          {times && <span className="ml-1 text-[11px]" style={{ color: "var(--dash-text-faint)" }}>/ {times}</span>}
                        </Td>
                        <Td>
                          <span className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap"
                            style={{ background: s.bg, color: s.text }}>
                            {STATUS_LABEL[app.status]}
                          </span>
                        </Td>
                        <Td muted>{fmtDate(app.createdAt)}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 결과 수 */}
      {!loading && filtered.length > 0 && (
        <p className="text-[12px] mt-3" style={{ color: "var(--dash-text-faint)" }}>
          {filtered.length}건 표시 중 (전체 {apps.length}건)
        </p>
      )}

    </div>
  );
}

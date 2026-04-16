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
  pending:   { text: "#f87171", bg: "rgba(248,113,113,0.10)" },
  confirmed: { text: "#fbbf24", bg: "rgba(234,179,8,0.10)"   },
  completed: { text: "#34d399", bg: "rgba(52,211,153,0.10)"  },
  cancelled: { text: "#5a5a5a", bg: "rgba(90,90,90,0.10)"    },
};

const STATUS_CHIPS = [
  { value: "pending",   label: "대기 중" },
  { value: "confirmed", label: "확정됨"  },
  { value: "completed", label: "완료"    },
  { value: "cancelled", label: "취소됨"  },
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
      style={{ color: "#3a3a3a", width }}
    >
      {children}
    </th>
  );
}

/* ── 테이블 바디 셀 ── */
function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className="px-4 py-3.5 text-[13px]" style={{ color: muted ? "#5a5a5a" : "#d0d0d0" }}>
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
    <div className="p-6">

      {/* 페이지 타이틀 + 요약 뱃지 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold" style={{ color: "#ffffff" }}>신청 관리</h2>
          <p className="text-[13px] mt-0.5" style={{ color: "#3a3a3a" }}>
            전체 {apps.length}건
          </p>
        </div>
        <div className="flex items-center gap-2">
          {STATUS_CHIPS.map(({ value, label }) => {
            const count = counts[value as AppStatus];
            if (count === 0) return null;
            const s = STATUS_STYLE[value as AppStatus];
            return (
              <span
                key={value}
                className="px-3 py-1 rounded-full text-[12px] font-semibold"
                style={{ background: s.bg, color: s.text }}
              >
                {label} {count}
              </span>
            );
          })}
        </div>
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

      {/* 테이블 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {loading ? (
          <div className="p-8 flex flex-col gap-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px]" style={{ color: "#3a3a3a" }}>
              {apps.length === 0 ? "신청 내역이 없습니다." : "검색 결과가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
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
                    <tr
                      key={app.id}
                      onClick={() => router.push(`/dashboard/applications/${app.id}`)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <Td muted>#{app.id.slice(-6).toUpperCase()}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                            style={{ background: "#1f1f1f", color: "#8eabff" }}
                          >
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
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
                              style={{ background: "rgba(142,171,255,0.10)", color: "#8eabff" }}
                            >
                              {p}
                            </span>
                          )) : <span style={{ color: "#2a2a2a" }}>—</span>}
                        </div>
                      </Td>
                      <Td muted>
                        <span>{days}</span>
                        {times && <span className="ml-1 text-[11px]" style={{ color: "#2a2a2a" }}>/ {times}</span>}
                      </Td>
                      <Td>
                        <span
                          className="px-2.5 py-1 rounded-full text-[11.5px] font-semibold whitespace-nowrap"
                          style={{ background: s.bg, color: s.text }}
                        >
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
        )}
      </div>

      {/* 결과 수 */}
      {!loading && filtered.length > 0 && (
        <p className="text-[12px] mt-3" style={{ color: "#2a2a2a" }}>
          {filtered.length}건 표시 중 (전체 {apps.length}건)
        </p>
      )}

    </div>
  );
}

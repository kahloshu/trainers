"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  STATUS_LABEL, DAY_LABEL, TIME_LABEL, timeAgoLabel, maskPhone,
  type Application, type AppStatus,
} from "@/app/data/applications";
import { fmtDate } from "@/lib/fmt";

const STATUS_COLOR: Record<AppStatus, { bg: string; text: string; dot: string; border: string }> = {
  pending:           { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", dot: "#60a5fa", border: "rgba(96,165,250,0.2)"  },
  received:          { bg: "rgba(96,165,250,0.10)",  text: "#60a5fa", dot: "#60a5fa", border: "rgba(96,165,250,0.2)"  },
  checking:          { bg: "rgba(251,191,36,0.10)",  text: "#fbbf24", dot: "#fbbf24", border: "rgba(251,191,36,0.2)"  },
  contact_scheduled: { bg: "rgba(167,139,250,0.10)", text: "#a78bfa", dot: "#a78bfa", border: "rgba(167,139,250,0.2)" },
  scheduling:        { bg: "rgba(251,146,60,0.10)",  text: "#fb923c", dot: "#fb923c", border: "rgba(251,146,60,0.2)"  },
  confirmed:         { bg: "rgba(234,179,8,0.10)",   text: "#fbbf24", dot: "#eab308", border: "rgba(234,179,8,0.2)"   },
  completed:         { bg: "rgba(52,211,153,0.10)",  text: "#34d399", dot: "#10b981", border: "rgba(52,211,153,0.2)"  },
  cancelled:         { bg: "rgba(90,90,90,0.10)",    text: "#a0a0a0", dot: "#5a5a5a", border: "rgba(90,90,90,0.2)"    },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span className="text-[12.5px] flex-shrink-0" style={{ color: "#5a5a5a" }}>{label}</span>
      <span className="text-[13px] font-medium text-right leading-snug" style={{ color: "#a0a0a0" }}>{value}</span>
    </div>
  );
}

function fmtShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

const ACTIVE_STATUSES = ["pending","received","checking","contact_scheduled","scheduling"];

const NEXT_STATUS: Partial<Record<AppStatus, AppStatus>> = {
  pending:           "checking",
  received:          "checking",
  checking:          "contact_scheduled",
  contact_scheduled: "scheduling",
  scheduling:        "confirmed",
};

const NEXT_LABEL: Partial<Record<AppStatus, string>> = {
  pending:           "확인중",
  received:          "확인중",
  checking:          "연락 예정",
  contact_scheduled: "일정 조율",
  scheduling:        "확정",
};

export default function TrainerAppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<Application | null | "loading">("loading");
  const [sessionLoading, setSessionLoading] = useState<1 | 2 | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  async function handleStatusChange(newStatus: AppStatus) {
    if (!app || app === "loading" || statusLoading) return;
    const prev = app;
    setStatusLoading(true);
    setApp({ ...app, status: newStatus });
    const res = await fetch(`/api/trainer/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) setApp(prev);
    setStatusLoading(false);
  }

  useEffect(() => {
    fetch(`/api/trainer/applications/${id}`)
      .then((r) => { if (r.status === 404) { setApp(null); return null; } return r.json(); })
      .then((d) => { if (d) setApp(d.application); });
  }, [id]);

  if (app === "loading") {
    return (
      <div className="min-h-dvh pb-24 animate-pulse px-4 pt-6" style={{ background: "#0e0e0e" }}>
        <div className="h-8 w-32 rounded-xl mb-6" style={{ background: "#1a1a1a" }} />
        <div className="h-40 rounded-2xl" style={{ background: "#1a1a1a" }} />
      </div>
    );
  }
  if (!app) return notFound();

  const sc   = STATUS_COLOR[app.status];
  const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");

  return (
    <div className="min-h-dvh pb-24" style={{ background: "#0e0e0e" }}>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 px-4 pt-5 pb-4 flex items-center gap-3"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M11 6L5 12L11 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold" style={{ color: "#ffffff" }}>신청 상세</h1>
          <p className="text-[11px]" style={{ color: "#3a3a3a" }}>
            #{app.applicationNumber || app.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1.5 rounded-full flex-shrink-0"
          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
          {STATUS_LABEL[app.status]}
        </span>
      </header>

      <main className="px-4 pt-4 flex flex-col gap-3">

        {/* 신청자 정보 */}
        <div className="p-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
            신청자 정보
          </p>
          <InfoRow label="이름"   value={app.applicantName} />
          <InfoRow label="연락처" value={maskPhone(app.applicantPhone)} />
          <InfoRow label="신청일" value={fmtDate(app.createdAt)} />
          <div className="pt-2">
            <p className="text-[11px]" style={{ color: "#3a3a3a" }}>
              {timeAgoLabel(app.createdMinutesAgo)} 신청
            </p>
          </div>
        </div>

        {/* 희망 일정 */}
        <div className="p-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
            희망 일정
          </p>
          <InfoRow label="희망 요일"   value={days  || "—"} />
          <InfoRow label="희망 시간대" value={times || "—"} />
        </div>

        {/* 운동 목적 */}
        {app.purposes.length > 0 && (
          <div className="p-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
              운동 목적
            </p>
            <div className="flex flex-wrap gap-2">
              {app.purposes.map((p) => (
                <span key={p} className="px-3 py-1.5 rounded-full text-[12.5px] font-medium"
                  style={{ background: "rgba(47,107,255,0.08)", color: "#2F6BFF" }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 요청사항 */}
        {app.userMessage && (
          <div className="p-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
              요청사항
            </p>
            <p className="text-[13.5px] leading-relaxed italic" style={{ color: "#a0a0a0" }}>
              &ldquo;{app.userMessage}&rdquo;
            </p>
          </div>
        )}

        {/* 운동 진행 세션 */}
        {(app.status === "confirmed" || app.status === "completed") && (
          <div className="p-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
              운동 진행 현황
            </p>
            <div className="flex flex-col gap-2.5">
              {([1, 2] as const).map((n) => {
                const completedAt = n === 1 ? app.session1CompletedAt : app.session2CompletedAt;
                const done = !!completedAt;
                const isLoading = sessionLoading === n;
                return (
                  <div key={n} className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl"
                    style={{ background: done ? "rgba(52,211,153,0.06)" : "#131313", border: `1px solid ${done ? "rgba(52,211,153,0.18)" : "rgba(255,255,255,0.04)"}` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: done ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)" }}>
                        {done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13L9 17L19 7" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className="text-[11px] font-bold" style={{ color: "#3a3a3a" }}>{n}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: done ? "#34d399" : "#5a5a5a" }}>
                          {n}차 운동 {done ? "완료" : "미완료"}
                        </p>
                        {done && completedAt && (
                          <p className="text-[11px]" style={{ color: "#3a3a3a" }}>{fmtShortDate(completedAt)}</p>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={isLoading}
                      onClick={async () => {
                        setSessionLoading(n);
                        const res = await fetch(`/api/trainer/applications/${id}/session`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ session: n, completed: !done }),
                        });
                        if (res.ok) {
                          const now = new Date().toISOString();
                          setApp((prev) => prev && prev !== "loading" ? {
                            ...prev,
                            session1CompletedAt: n === 1 ? (!done ? now : undefined) : prev.session1CompletedAt,
                            session2CompletedAt: n === 2 ? (!done ? now : undefined) : prev.session2CompletedAt,
                          } : prev);
                        }
                        setSessionLoading(null);
                      }}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-opacity disabled:opacity-40"
                      style={{
                        background: done ? "rgba(248,113,113,0.10)" : "rgba(52,211,153,0.12)",
                        color:      done ? "#f87171" : "#34d399",
                        border:     `1px solid ${done ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}`,
                      }}
                    >
                      {isLoading ? "…" : done ? "취소" : "완료"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 관리자 안내 메모 (읽기 전용) */}
        {app.adminNote && (
          <div className="p-4 rounded-2xl"
            style={{ background: "rgba(47,107,255,0.04)", border: "1px solid rgba(47,107,255,0.10)" }}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: "#2F6BFF" }}>
              안내 메모
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#a0a0a0" }}>
              {app.adminNote}
            </p>
          </div>
        )}

        {/* 상태 변경 */}
        {(ACTIVE_STATUSES.includes(app.status) || app.status === "confirmed") && (
          <div className="p-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
              상태 변경
            </p>
            <div className="flex flex-col gap-2">
              {ACTIVE_STATUSES.includes(app.status) && (
                <button
                  disabled={statusLoading}
                  onClick={() => handleStatusChange("confirmed")}
                  className="w-full py-3 rounded-2xl text-[14px] font-semibold disabled:opacity-40"
                  style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                  {statusLoading ? "처리 중…" : "✓ 확정하기"}
                </button>
              )}
              {app.status === "confirmed" && (
                <button
                  disabled={statusLoading}
                  onClick={() => handleStatusChange("completed")}
                  className="w-full py-3 rounded-2xl text-[14px] font-semibold disabled:opacity-40"
                  style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                  {statusLoading ? "처리 중…" : "✓ 완료 처리"}
                </button>
              )}
              {NEXT_STATUS[app.status] && app.status !== "scheduling" && (
                <button
                  disabled={statusLoading}
                  onClick={() => handleStatusChange(NEXT_STATUS[app.status]!)}
                  className="w-full py-3 rounded-2xl text-[14px] font-semibold disabled:opacity-40"
                  style={{ background: "rgba(47,107,255,0.10)", color: "#2F6BFF", border: "1px solid rgba(47,107,255,0.2)" }}>
                  {statusLoading ? "처리 중…" : `→ ${NEXT_LABEL[app.status]}으로 변경`}
                </button>
              )}
              <button
                disabled={statusLoading}
                onClick={() => handleStatusChange("cancelled")}
                className="w-full py-3 rounded-2xl text-[14px] font-semibold disabled:opacity-40"
                style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.15)" }}>
                {statusLoading ? "처리 중…" : "✗ 취소 처리"}
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

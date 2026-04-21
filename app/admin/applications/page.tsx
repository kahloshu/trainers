"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  STATUS_LABEL, DAY_LABEL, TIME_LABEL, timeAgoLabel, maskPhone,
  type Application, type AppStatus,
} from "@/app/data/applications";

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

const TABS = [
  { id: "all",       label: "전체"   },
  { id: "active",    label: "진행 중" },
  { id: "confirmed", label: "확정됨" },
  { id: "completed", label: "완료"   },
  { id: "cancelled", label: "취소"   },
] as const;
type TabId = (typeof TABS)[number]["id"];

const ACTIVE_STATUSES = ["pending","received","checking","contact_scheduled","scheduling"];

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

function AppCard({ app }: { app: Application }) {
  const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");
  return (
    <Link href={`/admin/applications/${app.id}`}
      className="flex flex-col gap-3 p-4 rounded-2xl border transition-opacity active:opacity-70"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14.5px] font-semibold" style={{ color: "#ffffff" }}>
            {app.applicantName}
          </p>
          <p className="text-[12px] mt-0.5" style={{ color: "#3a3a3a" }}>
            {maskPhone(app.applicantPhone)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={app.status} />
          <span className="text-[11px]" style={{ color: "#3a3a3a" }}>
            {timeAgoLabel(app.createdMinutesAgo)}
          </span>
        </div>
      </div>
      {(days || times) && (
        <div className="flex flex-wrap gap-1.5">
          {app.preferredDays.map((d) => (
            <span key={d} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#0e0e0e", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
              {DAY_LABEL[d] ?? d}
            </span>
          ))}
          {app.preferredTimes.map((t) => (
            <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#0e0e0e", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
              {TIME_LABEL[t] ?? t}
            </span>
          ))}
        </div>
      )}
      {app.userMessage && (
        <p className="text-[12px] leading-snug line-clamp-2 italic" style={{ color: "#5a5a5a" }}>
          &ldquo;{app.userMessage}&rdquo;
        </p>
      )}
      {app.purposes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {app.purposes.map((p) => (
            <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(47,107,255,0.08)", color: "#2F6BFF" }}>
              {p}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function TrainerApplicationsPage() {
  const [apps, setApps]         = useState<Application[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  useEffect(() => {
    fetch("/api/trainer/applications")
      .then((r) => r.json())
      .then((d) => { setApps(d.applications ?? []); setLoading(false); });
  }, []);

  const filtered = apps.filter((a) => {
    if (activeTab === "all")       return true;
    if (activeTab === "active")    return ACTIVE_STATUSES.includes(a.status);
    if (activeTab === "confirmed") return a.status === "confirmed";
    if (activeTab === "completed") return a.status === "completed";
    if (activeTab === "cancelled") return a.status === "cancelled";
    return true;
  });

  const counts: Record<TabId, number> = {
    all:       apps.length,
    active:    apps.filter((a) => ACTIVE_STATUSES.includes(a.status)).length,
    confirmed: apps.filter((a) => a.status === "confirmed").length,
    completed: apps.filter((a) => a.status === "completed").length,
    cancelled: apps.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="min-h-dvh pb-24" style={{ background: "#0e0e0e" }}>
      <header className="sticky top-0 z-40"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="px-4 pt-5 pb-3">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#2F6BFF" }}>MY</p>
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>내 신청 목록</h1>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150"
                style={{
                  background: isActive ? "#1a55d4" : "#1a1a1a",
                  color:      isActive ? "#fff"    : "#5a5a5a",
                  border:     `1.5px solid ${isActive ? "#1a55d4" : "rgba(255,255,255,0.06)"}`,
                }}>
                {tab.label}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#131313",
                    color:      isActive ? "#fff" : "#5a5a5a",
                  }}>
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-4 pt-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((app) => <AppCard key={app.id} app={app} />)}
            <p className="text-center text-[12px] py-4" style={{ color: "#131313" }}>
              — 모두 확인했습니다 —
            </p>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-[14px]" style={{ color: "#2a2a2a" }}>신청이 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllApplications, type AppStatus } from "@/app/data/applications";
import BottomNav from "@/app/components/BottomNav";

/* ── 상태 색상 ── */
const STATUS_COLOR: Record<AppStatus, { text: string; bg: string }> = {
  pending:   { text: "#f87171", bg: "rgba(248,113,113,0.10)" },
  confirmed: { text: "#fbbf24", bg: "rgba(234,179,8,0.10)" },
  completed: { text: "#34d399", bg: "rgba(52,211,153,0.10)" },
  cancelled: { text: "#a0a0a0", bg: "rgba(90,90,90,0.10)" },
};
const STATUS_LABEL: Record<AppStatus, string> = {
  pending:   "대기 중",
  confirmed: "확정됨",
  completed: "완료",
  cancelled: "취소됨",
};

/* ── 아이콘 ── */
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 페이지 ── */
export default function MyPage() {
  const [counts, setCounts] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });

  useEffect(() => {
    getAllApplications().then((apps) => {
      setCounts({
        total:     apps.length,
        pending:   apps.filter((a) => a.status === "pending").length,
        confirmed: apps.filter((a) => a.status === "confirmed").length,
        completed: apps.filter((a) => a.status === "completed").length,
      });
    });
  }, []);

  const menuItems = [
    {
      href:  "/my/applications",
      label: "내 신청 내역",
      sub:   "OT 신청 현황 확인",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="4" width="14" height="17" rx="2" stroke="#2F6BFF" strokeWidth="1.6" />
          <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#2F6BFF" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 11h6M9 15h4" stroke="#2F6BFF" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ),
      badge: counts.pending > 0 ? counts.pending : null,
      badgeColor: "#f87171",
    },
    {
      href:  "/",
      label: "트레이너 찾기",
      sub:   "OT 신청하기",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#2F6BFF" strokeWidth="1.6" />
          <path d="M20 20L16.65 16.65" stroke="#2F6BFF" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40 px-4 pt-safe-top"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="pt-5 pb-4">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#2F6BFF" }}>
            MY
          </p>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#ffffff" }}>
            마이페이지
          </h1>
        </div>
      </header>

      <main className="page-scroll pb-28">

        {/* ── 신청 현황 카드 ── */}
        <div className="px-4 pt-5">
          <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
            신청 현황
          </p>
          <Link
            href="/my/applications"
            className="block rounded-2xl p-4 transition-opacity active:opacity-70"
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold" style={{ color: "#ffffff" }}>전체 신청</span>
              <span className="text-[24px] font-bold" style={{ color: "#2F6BFF" }}>{counts.total}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["pending", "confirmed", "completed"] as AppStatus[]).map((s) => (
                <div
                  key={s}
                  className="flex flex-col items-center py-2.5 rounded-xl gap-1"
                  style={{ background: STATUS_COLOR[s].bg }}
                >
                  <span className="text-[18px] font-bold" style={{ color: STATUS_COLOR[s].text }}>
                    {counts[s as keyof typeof counts] ?? 0}
                  </span>
                  <span className="text-[10.5px] font-medium" style={{ color: STATUS_COLOR[s].text }}>
                    {STATUS_LABEL[s]}
                  </span>
                </div>
              ))}
            </div>
          </Link>
        </div>

        {/* ── 메뉴 목록 ── */}
        <div className="px-4 mt-6">
          <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
            메뉴
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
            {menuItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-4 transition-opacity active:opacity-70"
                style={{ borderBottom: i < menuItems.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(47,107,255,0.08)" }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>{item.label}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#5a5a5a" }}>{item.sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge !== null && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center"
                      style={{ background: "rgba(248,113,113,0.15)", color: item.badgeColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 안내 ── */}
        <div className="px-4 mt-6">
          <div
            className="rounded-2xl p-4"
            style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase mb-3" style={{ color: "#3a3a3a" }}>
              이용 안내
            </p>
            <div className="flex flex-col gap-3">
              {[
                { icon: "01", text: "홈에서 원하는 트레이너를 선택해 OT를 신청하세요." },
                { icon: "02", text: "신청 후 트레이너 확인 및 일정 조율이 이루어집니다." },
                { icon: "03", text: "OT 완료 후 트레이너 상세 페이지에서 후기를 남겨주세요." },
              ].map((item) => (
                <div key={item.icon} className="flex items-start gap-3">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(47,107,255,0.08)", color: "#2F6BFF" }}
                  >
                    {item.icon}
                  </span>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "#5a5a5a" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}

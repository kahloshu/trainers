"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApplicationsByPhone, type AppStatus } from "@/app/data/applications";
import BottomNav from "@/app/components/BottomNav";

const STORAGE_KEY = "jg_my_phone";

const STATUS_COLOR: Record<AppStatus, { text: string; bg: string }> = {
  pending:           { text: "#60a5fa", bg: "rgba(96,165,250,0.10)"  },
  received:          { text: "#60a5fa", bg: "rgba(96,165,250,0.10)"  },
  checking:          { text: "#fbbf24", bg: "rgba(251,191,36,0.10)"  },
  contact_scheduled: { text: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
  scheduling:        { text: "#fb923c", bg: "rgba(251,146,60,0.10)"  },
  confirmed:         { text: "#fbbf24", bg: "rgba(234,179,8,0.10)"   },
  completed:         { text: "#34d399", bg: "rgba(52,211,153,0.10)"  },
  cancelled:         { text: "#a0a0a0", bg: "rgba(90,90,90,0.10)"    },
};
const STATUS_LABEL: Record<AppStatus, string> = {
  pending:           "대기 중",
  received:          "접수됨",
  checking:          "확인중",
  contact_scheduled: "연락 예정",
  scheduling:        "일정 조율중",
  confirmed:         "확정됨",
  completed:         "완료",
  cancelled:         "취소됨",
};

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MyPage() {
  const [phone, setPhone]       = useState("");
  const [input, setInput]       = useState("");
  const [counts, setCounts]     = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  /* 저장된 전화번호 복원 */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) loadByPhone(saved);
  }, []);

  async function loadByPhone(ph: string) {
    setLoading(true);
    const apps = await getApplicationsByPhone(ph);
    setLoading(false);
    if (apps.length === 0 && ph !== phone) {
      setError("해당 번호로 신청 내역이 없습니다.");
      return;
    }
    setError("");
    setPhone(ph);
    localStorage.setItem(STORAGE_KEY, ph);
    setCounts({
      total:     apps.length,
      pending:   apps.filter((a) => ["pending","received","checking","contact_scheduled","scheduling"].includes(a.status)).length,
      confirmed: apps.filter((a) => a.status === "confirmed").length,
      completed: apps.filter((a) => a.status === "completed").length,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.length < 12) { setError("전화번호를 정확히 입력해 주세요."); return; }
    loadByPhone(input);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setPhone("");
    setInput("");
    setCounts({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  }

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>
      <header
        className="sticky top-0 z-40 px-4 pt-safe-top"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="pt-5 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#2F6BFF" }}>MY</p>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#ffffff" }}>마이페이지</h1>
          </div>
          {phone && (
            <button onClick={handleLogout} className="text-[12px] px-3 py-1.5 rounded-xl"
              style={{ background: "#1a1a1a", color: "#5a5a5a", border: "1px solid rgba(255,255,255,0.06)" }}>
              전화번호 변경
            </button>
          )}
        </div>
      </header>

      <main className="page-scroll pb-28">

        {!phone ? (
          /* ── 전화번호 입력 ── */
          <div className="px-4 pt-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(47,107,255,0.10)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke="#2F6BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold mb-1.5" style={{ color: "#ffffff" }}>신청 내역 확인</h2>
            <p className="text-[13px] text-center mb-8 leading-relaxed" style={{ color: "#5a5a5a" }}>
              OT 신청 시 입력한 전화번호로<br />내 신청 내역을 확인할 수 있습니다.
            </p>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <input
                type="tel"
                inputMode="numeric"
                value={input}
                onChange={(e) => { setInput(formatPhone(e.target.value)); setError(""); }}
                placeholder="010-0000-0000"
                className="w-full px-4 py-4 rounded-2xl text-[15px] outline-none text-center tracking-widest"
                style={{ background: "#1a1a1a", border: `1.5px solid ${error ? "#f87171" : "rgba(255,255,255,0.08)"}`, color: "#ffffff" }}
              />
              {error && <p className="text-[12.5px] text-center" style={{ color: "#f87171" }}>{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#2F6BFF,#1a55d4)", color: "#fff" }}
              >
                {loading ? "조회 중…" : "내 신청 내역 보기"}
              </button>
            </form>
          </div>
        ) : (
          /* ── 신청 현황 ── */
          <>
            <div className="px-4 pt-5">
              <p className="text-[11px] mb-1" style={{ color: "#3a3a3a" }}>{phone}</p>
              <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>신청 현황</p>
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
                  {(["pending","confirmed","completed"] as AppStatus[]).map((s) => (
                    <div key={s} className="flex flex-col items-center py-2.5 rounded-xl gap-1"
                      style={{ background: STATUS_COLOR[s].bg }}>
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

            <div className="px-4 mt-6">
              <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#3a3a3a" }}>메뉴</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  { href: "/my/applications", label: "내 신청 내역", sub: "OT 신청 현황 확인" },
                  { href: "/", label: "트레이너 찾기", sub: "OT 신청하기" },
                ].map((item, i, arr) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3.5 px-4 py-4 transition-opacity active:opacity-70"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>{item.label}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "#5a5a5a" }}>{item.sub}</p>
                    </div>
                    <ChevronRight />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

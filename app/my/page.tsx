"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
  completed:         { text: "var(--success)", bg: "rgba(52,211,153,0.10)"  },
  cancelled:         { text: "var(--text-secondary)", bg: "rgba(90,90,90,0.10)"    },
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
      <path d="M9 6L15 12L9 18" stroke="var(--text-dim)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Step = "phone" | "otp" | "done";

export default function MyPage() {
  const [step, setStep]           = useState<Step>("phone");
  const [phone, setPhone]         = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpDigits, setOtpDigits] = useState(["","","","","",""]);
  const [counts, setCounts]       = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCode, setDevCode] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* 저장된 전화번호 복원 */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) loadDashboard(saved);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 재전송 쿨다운 */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function loadDashboard(ph: string) {
    const apps = await getApplicationsByPhone(ph);
    setPhone(ph);
    setStep("done");
    setCounts({
      total:     apps.length,
      pending:   apps.filter((a) => ["pending","received","checking","contact_scheduled","scheduling"].includes(a.status)).length,
      confirmed: apps.filter((a) => a.status === "confirmed").length,
      completed: apps.filter((a) => a.status === "completed").length,
    });
  }

  /* 1단계: 전화번호 제출 → OTP 발송 */
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phoneInput.length < 12) { setError("전화번호를 정확히 입력해 주세요."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/user/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneInput }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
    setStep("otp");
    setOtpDigits(["","","","","",""]);
    setDevCode(data.devCode ?? "");
    setResendCooldown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  /* 2단계: OTP 확인 */
  async function handleVerifyOtp(codeOverride?: string) {
    const code = codeOverride ?? otpDigits.join("");
    if (code.length < 6) return;
    setLoading(true); setError("");
    const res = await fetch("/api/user/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneInput, code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "오류가 발생했습니다.");
      setOtpDigits(["","","","","",""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }
    localStorage.setItem(STORAGE_KEY, phoneInput);
    await loadDashboard(phoneInput);
  }

  /* OTP 입력 핸들러 */
  function handleOtpChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "")) {
      handleVerifyOtp(next.join(""));
    }
  }
  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setStep("phone"); setPhone(""); setPhoneInput(""); setError("");
    setCounts({ total: 0, pending: 0, confirmed: 0, completed: 0 });
  }

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-40 px-4"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="pt-5 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "var(--accent)" }}>MY</p>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>마이페이지</h1>
          </div>
          {step === "done" && (
            <button onClick={handleLogout} className="text-[12px] px-3 py-1.5 rounded-xl"
              style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
              전화번호 변경
            </button>
          )}
        </div>
      </header>

      <main className="page-scroll pb-28">

        {/* ── 1단계: 전화번호 입력 ── */}
        {step === "phone" && (
          <div className="px-4 pt-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "var(--accent-subtle)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>신청 내역 확인</h2>
            <p className="text-[13px] text-center mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              OT 신청 시 입력한 전화번호로<br />인증 후 내 신청 내역을 확인할 수 있습니다.
            </p>
            <form onSubmit={handleSendOtp} className="w-full flex flex-col gap-3">
              <input
                type="tel" inputMode="numeric"
                value={phoneInput}
                onChange={(e) => { setPhoneInput(formatPhone(e.target.value)); setError(""); }}
                placeholder="010-0000-0000"
                className="w-full px-4 py-4 rounded-2xl text-[15px] outline-none text-center tracking-widest"
                style={{ background: "var(--surface)", border: `1.5px solid ${error ? "var(--danger)" : "rgba(255,255,255,0.08)"}`, color: "var(--text-primary)" }}
              />
              {error && <p className="text-[12.5px] text-center" style={{ color: "var(--danger)" }}>{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent),#1a55d4)", color: "#fff" }}>
                {loading ? "전송 중…" : "인증코드 받기"}
              </button>
            </form>
          </div>
        )}

        {/* ── 2단계: OTP 입력 ── */}
        {step === "otp" && (
          <div className="px-4 pt-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "var(--accent-subtle)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--accent)" strokeWidth="1.6" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[18px] font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>인증코드 입력</h2>
            <p className="text-[13px] text-center mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "#9ca3af" }}>{phoneInput}</span>으로<br />발송된 6자리 코드를 입력해 주세요.
            </p>

            {/* OTP 6칸 */}
            <div className="flex gap-2 mb-4">
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text" inputMode="numeric"
                  maxLength={1} value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 text-center text-[20px] font-bold rounded-xl outline-none"
                  style={{
                    background: "var(--surface)",
                    border: `1.5px solid ${error ? "var(--danger)" : d ? "var(--accent)" : "rgba(255,255,255,0.08)"}`,
                    color: "var(--text-primary)",
                  }}
                />
              ))}
            </div>

            {devCode && (
              <div className="mb-3 px-4 py-2.5 rounded-xl text-center"
                style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <p className="text-[10.5px] mb-1" style={{ color: "#6b7280" }}>임시 인증코드 (SMS 미연동)</p>
                <p className="text-[22px] font-bold tracking-[0.3em]" style={{ color: "#fbbf24" }}>{devCode}</p>
              </div>
            )}
            {error && <p className="text-[12.5px] text-center mb-3" style={{ color: "var(--danger)" }}>{error}</p>}

            <button
              onClick={() => handleVerifyOtp()}
              disabled={loading || otpDigits.join("").length < 6}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold disabled:opacity-40 mb-4"
              style={{ background: "linear-gradient(135deg,var(--accent),#1a55d4)", color: "#fff" }}
            >
              {loading ? "확인 중…" : "인증하기"}
            </button>

            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { setStep("phone"); setError(""); }}
                className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
                번호 변경
              </button>
              <span style={{ color: "#2a2a2a" }}>|</span>
              <button
                onClick={() => { setStep("phone"); setTimeout(() => { document.querySelector("form")?.requestSubmit(); }, 50); }}
                disabled={resendCooldown > 0}
                className="text-[12.5px] disabled:opacity-40"
                style={{ color: resendCooldown > 0 ? "var(--text-muted)" : "var(--accent)" }}>
                {resendCooldown > 0 ? `재전송 (${resendCooldown}s)` : "재전송"}
              </button>
            </div>
          </div>
        )}

        {/* ── 3단계: 대시보드 ── */}
        {step === "done" && (
          <>
            <div className="px-4 pt-5">
              <p className="text-[11px] mb-1" style={{ color: "var(--text-dim)" }}>{phone}</p>
              <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--text-dim)" }}>신청 현황</p>
              <Link href="/my/applications"
                className="block rounded-2xl p-4 transition-opacity active:opacity-70"
                style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>전체 신청</span>
                  <span className="text-[24px] font-bold" style={{ color: "var(--accent)" }}>{counts.total}</span>
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
              <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "var(--text-dim)" }}>메뉴</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                {[
                  { href: "/my/applications", label: "내 신청 내역", sub: "OT 신청 현황 확인" },
                  { href: "/my/reviews",      label: "내 후기",      sub: "작성한 후기 모아보기" },
                  { href: "/", label: "트레이너 찾기", sub: "OT 신청하기" },
                ].map((item, i, arr) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3.5 px-4 py-4 transition-opacity active:opacity-70"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>{item.sub}</p>
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

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = "phone" | "otp";

export default function TrainerLoginPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>("phone");
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [trainerName, setTrainerName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resendSec, setResendSec] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 재발송 타이머
  useEffect(() => {
    if (resendSec <= 0) return;
    const t = setTimeout(() => setResendSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSec]);

  /* ── 전화번호 포맷 ── */
  function formatPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return `${d.slice(0,3)}-${d.slice(3)}`;
    return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  }

  /* ── OTP 입력 처리 ── */
  function handleOtpChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    if (char && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (!char && idx > 0) otpRefs.current[idx - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  /* ── 인증코드 발송 ── */
  async function sendOtp() {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setTrainerName(data.trainerName);
      setStep("otp");
      setResendSec(180);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  /* ── OTP 검증 ── */
  async function verifyOtp() {
    const code = otp.join("");
    if (code.length < 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trainer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.replace("/admin");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5"
      style={{ background: "#0e0e0e" }}
    >
      {/* 로고 */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #2F6BFF 0%, #1a55d4 100%)" }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9Z"
              fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: "#2F6BFF" }}>
            James Gym
          </p>
          <h1 className="text-[22px] font-bold" style={{ color: "#ffffff" }}>
            트레이너 로그인
          </h1>
        </div>
      </div>

      {/* 카드 */}
      <div
        className="w-full max-w-[380px] rounded-3xl p-6"
        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {step === "phone" ? (
          <>
            <p className="text-[14px] font-semibold mb-1" style={{ color: "#ffffff" }}>
              전화번호 입력
            </p>
            <p className="text-[12.5px] mb-5" style={{ color: "#5a5a5a" }}>
              등록된 전화번호로 인증코드를 발송합니다.
            </p>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              className="w-full px-4 py-3.5 rounded-2xl text-[15px] outline-none mb-3"
              style={{
                background: "#252525",
                border: "1.5px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {error && (
              <p className="text-[12px] mb-3" style={{ color: "#f87171" }}>{error}</p>
            )}
            <button
              onClick={sendOtp}
              disabled={phone.replace(/\D/g, "").length < 10 || loading}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold transition-opacity disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #2F6BFF 0%, #1a55d4 100%)", color: "#fff" }}
            >
              {loading ? "확인 중…" : "인증코드 발송"}
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold mb-1" style={{ color: "#ffffff" }}>
              인증코드 입력
            </p>
            <p className="text-[12.5px] mb-5" style={{ color: "#5a5a5a" }}>
              <span style={{ color: "#a0a0a0" }}>{phone}</span>으로 발송된 6자리 코드를 입력해주세요.
              {trainerName && (
                <span className="block mt-0.5" style={{ color: "#2F6BFF" }}>
                  안녕하세요, {trainerName} 트레이너님!
                </span>
              )}
            </p>

            {/* OTP 입력 박스 */}
            <div className="flex gap-2 mb-4" onPaste={handleOtpPaste}>
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !v && i > 0) otpRefs.current[i - 1]?.focus();
                  }}
                  className="flex-1 h-12 text-center text-[20px] font-bold rounded-xl outline-none"
                  style={{
                    background: v ? "rgba(47,107,255,0.12)" : "#252525",
                    border: `1.5px solid ${v ? "#2F6BFF" : "rgba(255,255,255,0.08)"}`,
                    color: "#ffffff",
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="text-[12px] mb-3" style={{ color: "#f87171" }}>{error}</p>
            )}

            <button
              onClick={verifyOtp}
              disabled={otp.join("").length < 6 || loading}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold transition-opacity disabled:opacity-40 mb-3"
              style={{ background: "linear-gradient(135deg, #2F6BFF 0%, #1a55d4 100%)", color: "#fff" }}
            >
              {loading ? "확인 중…" : "로그인"}
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
                className="text-[12px]"
                style={{ color: "#5a5a5a" }}
              >
                번호 변경
              </button>
              <button
                onClick={sendOtp}
                disabled={resendSec > 0 || loading}
                className="text-[12px] disabled:opacity-40"
                style={{ color: resendSec > 0 ? "#5a5a5a" : "#2F6BFF" }}
              >
                {resendSec > 0 ? `재발송 ${Math.floor(resendSec/60)}:${String(resendSec%60).padStart(2,"0")}` : "재발송"}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 text-[11.5px] text-center" style={{ color: "#2a2a2a" }}>
        트레이너 등록은 관리자에게 문의해주세요.
      </p>
    </div>
  );
}

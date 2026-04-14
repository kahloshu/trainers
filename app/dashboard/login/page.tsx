"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "@/lib/auth";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      if (s) router.replace("/dashboard");
      else setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    } else {
      router.replace("/dashboard");
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#8eabff", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "#0a0a0a" }}
    >
      {/* 배경 그라데이션 glow */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          background: "radial-gradient(circle, rgba(142,171,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative w-full max-w-[400px] mx-4">
        {/* 로고 */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, #8eabff 0%, #156aff 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9Z"
                fill="rgba(0,0,0,0.7)" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold mb-1" style={{ color: "#ffffff" }}>
            James Gym
          </h1>
          <p className="text-[13px]" style={{ color: "#5a5a5a" }}>관리자 대시보드</p>
        </div>

        {/* 폼 카드 */}
        <div
          className="rounded-3xl p-7"
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
          }}
        >
          <h2 className="text-[16px] font-semibold mb-6" style={{ color: "#ffffff" }}>로그인</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium tracking-wide" style={{ color: "#5a5a5a" }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jamesgym.kr"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: "#0e0e0e",
                  border: "1.5px solid rgba(255,255,255,0.06)",
                  color: "#ffffff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8eabff")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium tracking-wide" style={{ color: "#5a5a5a" }}>
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
                style={{
                  background: "#0e0e0e",
                  border: "1.5px solid rgba(255,255,255,0.06)",
                  color: "#ffffff",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8eabff")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
              />
            </div>

            {/* 에러 */}
            {error && (
              <div
                className="px-4 py-3 rounded-xl text-[13px]"
                style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.15)" }}
              >
                {error}
              </div>
            )}

            {/* 버튼 */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-xl text-[14px] font-bold mt-1 transition-opacity disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #8eabff 0%, #156aff 100%)",
                color: "#000000",
              }}
            >
              {loading ? "로그인 중…" : "로그인"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] mt-6" style={{ color: "#2a2a2a" }}>
          James Gym Admin Dashboard v2.0
        </p>
      </div>
    </div>
  );
}

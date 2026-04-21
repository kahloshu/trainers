"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrainer } from "../layout";

export default function TrainerMorePage() {
  const trainer = useTrainer();
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/trainer/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background: "#0e0e0e" }}>
      <header className="px-4 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#2F6BFF" }}>MY</p>
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>더보기</h1>
      </header>

      <main className="px-4 pt-5 flex flex-col gap-3">
        {/* 트레이너 정보 */}
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-bold flex-shrink-0"
            style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF", border: "1px solid rgba(47,107,255,0.2)" }}>
            {trainer?.trainerName?.charAt(0) ?? "T"}
          </div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>
              {trainer?.trainerName ?? "트레이너"} 트레이너
            </p>
            <p className="text-[12px]" style={{ color: "#3a3a3a" }}>
              {trainer?.phone ? `${trainer.phone.slice(0,3)}-****-${trainer.phone.slice(-4)}` : ""}
            </p>
          </div>
        </div>

        {/* 안내 */}
        <div className="p-4 rounded-2xl"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "#5a5a5a" }}>
            프로필 수정, 소개 변경, 사진 업로드 등은 관리자에게 문의해주세요.
          </p>
        </div>

        {/* 로그아웃 */}
        <button onClick={handleLogout} disabled={loading}
          className="w-full py-4 rounded-2xl text-[14px] font-semibold transition-opacity disabled:opacity-50"
          style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.12)" }}>
          {loading ? "로그아웃 중…" : "로그아웃"}
        </button>

        <p className="text-center text-[11px] mt-2" style={{ color: "#2a2a2a" }}>
          James Gym Trainer Dashboard
        </p>
      </main>
    </div>
  );
}

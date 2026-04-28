"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/* ── 레이블 맵 ── */
const DAY_LABEL: Record<string, string> = {
  weekday: "평일", saturday: "토요일", sunday: "일요일",
};
const TIME_LABEL: Record<string, string> = {
  morning: "오전", afternoon: "오후", evening: "저녁",
};

/* ── 아이콘 ── */
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ── 요약 행 ── */
function SummaryRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 py-3.5">
        <span className="text-[13px] flex-shrink-0" style={{ color: "#6b7280" }}>{label}</span>
        <span className="text-[13px] font-medium text-right leading-snug" style={{ color: "#fbfafa" }}>{value}</span>
      </div>
      {!last && <div className="h-px" style={{ background: "#2a2a2a" }} />}
    </>
  );
}

/* ── 메인 콘텐츠 ── */
function DoneContent() {
  const searchParams = useSearchParams();
  const trainerName = searchParams.get("trainer") ?? "트레이너";
  const appNo       = searchParams.get("appNo") ?? "";
  const days  = (searchParams.get("days") ?? "").split(",").filter(Boolean).map((d) => DAY_LABEL[d] ?? d);
  const times = (searchParams.get("times") ?? "").split(",").filter(Boolean).map((t) => TIME_LABEL[t] ?? t);

  async function handleCopy() {
    if (!appNo) return;
    try { await navigator.clipboard.writeText(appNo); } catch {}
  }

  return (
    <div className="min-h-dvh flex flex-col px-5" style={{ background: "#1e1e1e" }}>

      <style>{`
        @keyframes pop-in   { 0% { transform:scale(0.5);opacity:0 } 70% { transform:scale(1.08) } 100% { transform:scale(1);opacity:1 } }
        @keyframes draw-check { 0% { stroke-dashoffset:40 } 100% { stroke-dashoffset:0 } }
        @keyframes fade-up  { from { transform:translateY(12px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        .anim-pop    { animation: pop-in    0.45s cubic-bezier(0.34,1.56,0.64,1) both }
        .anim-check  { animation: draw-check 0.4s 0.3s ease both }
        .anim-t1     { animation: fade-up 0.4s 0.45s ease both }
        .anim-t2     { animation: fade-up 0.4s 0.58s ease both }
        .anim-num    { animation: fade-up 0.4s 0.70s ease both }
        .anim-card   { animation: fade-up 0.4s 0.82s ease both }
        .anim-notice { animation: fade-up 0.4s 0.94s ease both }
        .anim-btns   { animation: fade-up 0.4s 1.06s ease both }
      `}</style>

      {/* 상단 */}
      <div className="flex flex-col items-center text-center pt-14 pb-6">

        {/* 체크 원 */}
        <div className="anim-pop relative w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "radial-gradient(circle at 40% 35%, rgba(47,128,237,0.22), rgba(47,128,237,0.06))",
            border: "1.5px solid rgba(47,128,237,0.3)",
            boxShadow: "0 0 28px rgba(47,128,237,0.15)",
          }}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
            <path className="anim-check" d="M10 21L17 28L30 14"
              stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="40" strokeDashoffset="40" />
          </svg>
        </div>

        <p className="anim-t1 text-[10.5px] font-semibold tracking-[0.22em] uppercase mb-2" style={{ color: "#2f80ed" }}>
          James Gym
        </p>
        <h1 className="anim-t1 text-[24px] font-bold tracking-tight leading-tight mb-2.5" style={{ color: "#fbfafa" }}>
          신청이 완료되었습니다.
        </h1>
        <p className="anim-t2 text-[13.5px] leading-[1.7]" style={{ color: "#6b7280" }}>
          <span style={{ color: "#9ca3af" }}>{trainerName} 트레이너</span>에게<br />신청 내용이 전달되었습니다.
        </p>
      </div>

      {/* ── 신청번호 카드 (핵심) ── */}
      {appNo && (
        <div className="anim-num rounded-2xl overflow-hidden mb-3"
          style={{ background: "linear-gradient(135deg, rgba(47,128,237,0.15) 0%, rgba(47,128,237,0.06) 100%)", border: "1px solid rgba(47,128,237,0.25)" }}>
          <div className="px-5 pt-5 pb-4 flex flex-col items-center gap-3">
            <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#4b7dba" }}>
              신청번호
            </p>
            <p className="text-[26px] font-black tracking-widest" style={{ color: "#fbfafa", letterSpacing: "0.12em" }}>
              {appNo}
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-opacity active:opacity-70"
              style={{ background: "rgba(47,128,237,0.18)", color: "#7ab3ef" }}>
              <CopyIcon />
              번호 복사
            </button>
          </div>
          <div className="px-5 pb-4">
            <p className="text-[12px] text-center leading-relaxed" style={{ color: "#4b6a8a" }}>
              이 신청번호로 신청 상태를 조회할 수 있습니다.<br />
              <span style={{ color: "#3a5a7a" }}>분실 시 이름 + 전화번호로도 조회 가능합니다.</span>
            </p>
          </div>
        </div>
      )}

      {/* 신청 요약 */}
      <div className="anim-card rounded-2xl overflow-hidden mb-3"
        style={{ background: "var(--surface-input)", border: "1px solid #2f2f2f" }}>
        <div className="flex items-center gap-2 px-5 py-3.5" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#2f80ed" }} />
          <span className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#4b5563" }}>신청 요약</span>
        </div>
        <div className="px-5">
          <SummaryRow label="신청 트레이너" value={`${trainerName} 트레이너`} />
          <SummaryRow label="희망 요일"    value={days.length > 0 ? days.join(", ") : "—"} />
          <SummaryRow label="희망 시간대"  value={times.length > 0 ? times.join(", ") : "—"} last />
        </div>
      </div>

      {/* 안내 */}
      <div className="anim-notice rounded-2xl p-4 mb-6" style={{ background: "var(--surface-input)", border: "1px solid #2f2f2f" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#2f80ed" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="0.8" fill="#2f80ed" />
          </svg>
          <span className="text-[11px] font-semibold tracking-[0.1em]" style={{ color: "#2f80ed" }}>안내</span>
        </div>
        <p className="text-[12.5px] leading-[1.85]" style={{ color: "#6b7280" }}>
          트레이너 확인 후 등록하신 연락처로{" "}
          <span style={{ color: "#9ca3af" }}>직접 연락드릴 예정입니다.</span><br /><br />
          수업 일정에 따라 안내까지 다소 시간이 소요될 수 있습니다.
        </p>
      </div>

      {/* 하단 버튼 */}
      <div className="anim-btns flex flex-col gap-2.5 pb-12">
        <Link
          href={`/lookup?appNo=${encodeURIComponent(appNo)}`}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] transition-opacity active:opacity-80"
          style={{ background: "#2f80ed", color: "#fff" }}>
          <SearchIcon />
          <span>신청 상태 조회하기</span>
        </Link>
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-[14px] transition-opacity active:opacity-70"
          style={{ background: "var(--surface-input)", color: "#9ca3af", border: "1px solid #303030" }}>
          <HomeIcon />
          <span>트레이너 더 둘러보기</span>
        </Link>
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function DonePage({ params }: { params: Promise<{ id: string }> }) {
  use(params);
  return (
    <Suspense>
      <DoneContent />
    </Suspense>
  );
}

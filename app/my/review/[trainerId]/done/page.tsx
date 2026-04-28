"use client";

import { use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ── 상수 ── */
const STAR_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#2f80ed",
};
const STAR_MESSAGES: Record<number, { title: string; sub: string }> = {
  1: { title: "아쉬운 경험이 있으셨군요.", sub: "더 나은 서비스를 위해 개선하겠습니다." },
  2: { title: "조금 아쉬우셨군요.", sub: "소중한 의견 감사합니다. 더 노력하겠습니다." },
  3: { title: "보통이셨군요.", sub: "더 좋은 경험을 드릴 수 있도록 노력하겠습니다." },
  4: { title: "만족스러우셨군요.", sub: "함께해 주셔서 감사합니다." },
  5: { title: "매우 만족스러우셨군요.", sub: "최고의 후기 감사합니다." },
};

/* ── 아이콘 ── */
function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 별 아이콘 단일 ── */
function StarIcon({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={color}
      />
    </svg>
  );
}

/* ── 별점 줄 ── */
function StarRow({ rating, color }: { rating: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} color={i <= rating ? color : "#2a2a2a"} size={18} />
      ))}
    </div>
  );
}

/* ── 메인 콘텐츠 ── */
function DoneContent({ trainerId }: { trainerId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rating = Math.min(5, Math.max(1, Number(searchParams.get("rating") ?? 5)));
  const trainerName = searchParams.get("trainer") ?? "트레이너";
  const comment = searchParams.get("comment") ?? "";

  const color = STAR_COLORS[rating] ?? "#2f80ed";
  const msg = STAR_MESSAGES[rating] ?? STAR_MESSAGES[5];

  return (
    <div className="min-h-dvh flex flex-col px-5" style={{ background: "#1e1e1e" }}>
      <style>{`
        @keyframes ring-grow {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes star-pop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          65%  { transform: scale(1.18) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fade-up {
          from { transform: translateY(14px); opacity: 0; }
          to   { transform: translateY(0px);  opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 24px ${color}22; }
          50%       { box-shadow: 0 0 48px ${color}44; }
        }
        .ring  { animation: ring-grow  0.45s cubic-bezier(.34,1.56,.64,1) both; }
        .star  { animation: star-pop   0.42s 0.18s cubic-bezier(.34,1.56,.64,1) both; }
        .glow  { animation: glow-pulse 2.4s 0.6s ease-in-out infinite; }
        .fu1   { animation: fade-up 0.38s 0.38s ease both; }
        .fu2   { animation: fade-up 0.38s 0.52s ease both; }
        .fu3   { animation: fade-up 0.38s 0.68s ease both; }
        .fu4   { animation: fade-up 0.38s 0.82s ease both; }
        .fu5   { animation: fade-up 0.38s 0.96s ease both; }
      `}</style>

      {/* ── 상단 히어로 영역 ── */}
      <div className="flex flex-col items-center text-center pt-16 pb-8">

        {/* 별 아이콘 + 링 */}
        <div className="relative mb-8">
          {/* 바깥 링 */}
          <div
            className="ring glow w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 38% 32%, ${color}1a, ${color}06)`,
              border: `1.5px solid ${color}35`,
            }}
          >
            <span className="star">
              <StarIcon color={color} size={52} />
            </span>
          </div>

          {/* 작은 장식 별 */}
          <span
            className="star absolute -top-1 -right-1"
            style={{ animationDelay: "0.28s" }}
          >
            <StarIcon color={color} size={14} />
          </span>
          <span
            className="star absolute bottom-0 -left-2"
            style={{ animationDelay: "0.34s" }}
          >
            <StarIcon color={color} size={10} />
          </span>
        </div>

        {/* 브랜드 레이블 */}
        <p
          className="fu1 text-[10.5px] font-semibold tracking-[0.22em] uppercase mb-3"
          style={{ color: "#2f80ed" }}
        >
          James Gym
        </p>

        {/* 제목 */}
        <h1
          className="fu1 text-[25px] font-bold tracking-tight leading-tight mb-2"
          style={{ color: "#fbfafa" }}
        >
          후기가 등록되었습니다.
        </h1>

        {/* 별점 메시지 */}
        <p
          className="fu2 text-[14px] font-medium mb-1"
          style={{ color }}
        >
          {msg.title}
        </p>
        <p
          className="fu2 text-[13px] leading-relaxed"
          style={{ color: "#6b7280" }}
        >
          {msg.sub}
        </p>
      </div>

      {/* ── 내가 남긴 후기 카드 ── */}
      <div
        className="fu3 rounded-2xl overflow-hidden mb-3"
        style={{ background: "var(--surface-input)", border: "1px solid #2f2f2f" }}
      >
        {/* 카드 헤더 */}
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          <span className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#4b5563" }}>
            내가 남긴 후기
          </span>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* 트레이너 + 별점 */}
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>
              {trainerName} 트레이너
            </span>
            <StarRow rating={rating} color={color} />
          </div>

          {/* 후기 문구 */}
          {comment && (
            <>
              <div className="h-px" style={{ background: "#2a2a2a" }} />
              <p
                className="text-[13.5px] leading-relaxed italic"
                style={{ color: "#d1d5db" }}
              >
                &ldquo;{comment}&rdquo;
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── 안내 박스 ── */}
      <div
        className="fu4 rounded-2xl p-4 mb-8"
        style={{ background: "var(--surface-input)", border: "1px solid #2f2f2f" }}
      >
        <div className="flex items-start gap-2.5">
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#2f80ed" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="0.8" fill="#2f80ed" />
          </svg>
          <p className="text-[12.5px] leading-[1.85]" style={{ color: "#6b7280" }}>
            작성하신 한줄 후기와 별점은{" "}
            <span style={{ color: "#9ca3af" }}>트레이너 상세 페이지에 공개</span>됩니다.
            <br />
            후기는 신청 건당 한 번만 작성할 수 있습니다.
          </p>
        </div>
      </div>

      {/* ── 하단 버튼 ── */}
      <div className="fu5 flex flex-col gap-2.5 pb-12 mt-auto">
        <Link
          href="/my/applications"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] transition-opacity active:opacity-80"
          style={{ background: "#2f80ed", color: "#fff" }}
        >
          <span>내 신청 내역으로</span>
          <ArrowRight />
        </Link>
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-[14px] transition-opacity active:opacity-70"
          style={{ background: "var(--surface-input)", color: "#9ca3af", border: "1px solid #303030" }}
        >
          <HomeIcon />
          <span>트레이너 둘러보기</span>
        </Link>
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function ReviewDonePage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId } = use(params);
  return (
    <Suspense>
      <DoneContent trainerId={trainerId} />
    </Suspense>
  );
}

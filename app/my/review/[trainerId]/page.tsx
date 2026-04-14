"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTrainerById, type Trainer } from "@/app/data/trainers";
import { notFound } from "next/navigation";

/* ────────────── 상수 ────────────── */
const STAR_LABELS = ["", "아쉬웠습니다.", "조금 아쉬웠습니다.", "보통이었습니다.", "만족스러웠습니다.", "매우 만족스러웠습니다."];
const STAR_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#2f80ed"];

/* ────────────── 아이콘 ────────────── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#fbfafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6b7280" strokeWidth="1.6" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#2f80ed" strokeWidth="1.6" />
      <path d="M12 3c-2 3-2 15 0 18M12 3c2 3 2 15 0 18M3 12h18" stroke="#2f80ed" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M13 6L19 12L13 18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────── 이니셜 아바타 ────────────── */
function MiniAvatar({ name }: { name: string }) {
  const colors = ["#1a4a8a", "#1a6a3a", "#4a1a8a", "#8a1a1a", "#6a6a1a", "#1a6a6a"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-[15px] font-bold text-white"
      style={{ background: bg }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* ────────────── 별점 컴포넌트 ────────────── */
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 별 5개 */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onTouchStart={() => setHover(i)}
            onTouchEnd={() => { onChange(i); setHover(0); }}
            onClick={() => onChange(i)}
            className="transition-transform duration-100 active:scale-90"
            style={{ transform: display >= i ? "scale(1.1)" : "scale(1)" }}
            aria-label={`${i}점`}
          >
            <svg width="44" height="44" viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={display >= i ? (STAR_COLORS[display] ?? "#c9a96e") : "#2a2a2a"}
                stroke={display >= i ? (STAR_COLORS[display] ?? "#c9a96e") : "#383838"}
                strokeWidth="0.5"
                style={{ transition: "fill 0.15s ease" }}
              />
            </svg>
          </button>
        ))}
      </div>

      {/* 피드백 문구 */}
      <div className="h-6 flex items-center">
        {display > 0 ? (
          <p
            className="text-[14px] font-semibold transition-all duration-200"
            style={{ color: STAR_COLORS[display] }}
          >
            {STAR_LABELS[display]}
          </p>
        ) : (
          <p className="text-[13px]" style={{ color: "#4b5563" }}>
            별을 선택해 주세요
          </p>
        )}
      </div>
    </div>
  );
}

/* ────────────── 구분선 ────────────── */
function Divider() {
  return <div className="h-px mx-4" style={{ background: "#2a2a2a" }} />;
}

/* ────────────── 필드 레이블 ────────────── */
function FieldLabel({
  children,
  required,
  badge,
  badgeColor,
  count,
  max,
}: {
  children: React.ReactNode;
  required?: boolean;
  badge?: string;
  badgeColor?: string;
  count?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[13.5px] font-semibold" style={{ color: "#fbfafa" }}>
        {children}
      </span>
      {required && (
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: "rgba(47,128,237,0.15)", color: "#2f80ed" }}>
          필수
        </span>
      )}
      {badge && (
        <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: badgeColor ?? "#252525", color: "#6b7280" }}>
          {badge}
        </span>
      )}
      {count !== undefined && max !== undefined && (
        <span className="ml-auto text-[11px]" style={{ color: count >= max ? "#ef4444" : "#4b5563" }}>
          {count} / {max}
        </span>
      )}
    </div>
  );
}

/* ────────────── 페이지 ────────────── */
export default function ReviewPage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId } = use(params);
  const router = useRouter();

  const [trainer, setTrainer]   = useState<Trainer | null | "loading">("loading");
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTrainerById(trainerId).then((found) => {
      setTrainer(found ?? null);
    });
  }, [trainerId]);

  if (trainer === "loading") {
    return <div className="min-h-dvh" style={{ background: "#1e1e1e" }} />;
  }
  if (!trainer) return notFound();

  const isValid = rating > 0 && comment.trim().length > 0;

  async function handleSubmit() {
    if (!isValid || !trainer || trainer === "loading") return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push(
      `/my/review/${trainerId}/done?rating=${rating}&trainer=${encodeURIComponent(trainer.name)}&comment=${encodeURIComponent(comment)}`
    );
  }

  /* ── 작성 폼 ── */
  return (
    <div className="min-h-dvh" style={{ background: "#1e1e1e" }}>

      {/* ── 네비 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(30,30,30,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2a2a2a" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#2a2a2a" }}
        >
          <BackIcon />
        </button>
        <span className="text-[15px] font-semibold" style={{ color: "#fbfafa" }}>후기 작성</span>
        <div className="w-9" />
      </header>

      <div className="flex flex-col gap-px pb-36">

        {/* ── 트레이너 카드 ── */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-[13.5px] leading-relaxed mb-4 text-center" style={{ color: "#9ca3af" }}>
            <span style={{ color: "#fbfafa" }}>{trainer.name} 트레이너</span>와의
            <br />
            OT는 어떠셨나요?
          </p>
          <div
            className="flex items-center gap-3 p-3.5 rounded-2xl border"
            style={{ background: "#252525", borderColor: "#2f2f2f" }}
          >
            <MiniAvatar name={trainer.name} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold" style={{ color: "#fbfafa" }}>
                {trainer.name} 트레이너
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                {trainer.specialty} · {trainer.careerYears}년차
              </p>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── 별점 ── */}
        <div className="px-4 pt-5 pb-5">
          <FieldLabel required>전반적인 만족도</FieldLabel>
          <div className="flex justify-center pt-2">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        <Divider />

        {/* ── 공개 한줄 후기 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel
            required
            badge="공개"
            badgeColor="rgba(47,128,237,0.12)"
            count={comment.length}
            max={50}
          >
            한줄 후기
          </FieldLabel>

          {/* 공개 안내 */}
          <div
            className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(47,128,237,0.06)", border: "1px solid rgba(47,128,237,0.12)" }}
          >
            <GlobeIcon />
            <p className="text-[11.5px]" style={{ color: "#2f80ed" }}>
              트레이너 상세 페이지에 공개됩니다.
            </p>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 50))}
            placeholder="다른 회원들에게 도움이 될 짧은 후기를 남겨주세요."
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl text-[13.5px] outline-none resize-none leading-relaxed transition-all"
            style={{ background: "#252525", border: "1.5px solid #383838", color: "#fbfafa" }}
            onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
            onBlur={(e) => (e.target.style.borderColor = "#383838")}
          />
        </div>

        <Divider />

        {/* ── 비공개 관리자 메모 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel
            badge="비공개"
            count={adminNote.length}
            max={300}
          >
            관리자에게 전달할 내용
          </FieldLabel>

          {/* 비공개 안내 */}
          <div
            className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl"
            style={{ background: "#252525", border: "1px solid #2f2f2f" }}
          >
            <LockIcon />
            <p className="text-[11.5px]" style={{ color: "#6b7280" }}>
              관리자만 확인하며, 외부에 공개되지 않습니다.
            </p>
          </div>

          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value.slice(0, 300))}
            placeholder={"수업 외 불편한 점이나 개선 의견을 편하게 남겨주세요."}
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl text-[13.5px] outline-none resize-none leading-relaxed transition-all"
            style={{ background: "#252525", border: "1.5px solid #383838", color: "#fbfafa" }}
            onFocus={(e) => (e.target.style.borderColor = "#383838")}
            onBlur={(e) => (e.target.style.borderColor = "#383838")}
          />
        </div>

        {/* ── 공개/비공개 구분 안내 ── */}
        <div className="px-4 pt-1 pb-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: "#252525", border: "1px solid #2f2f2f" }}
          >
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: "#4b5563" }}>
              공개 범위 안내
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                  <GlobeIcon />
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#6b7280" }}>
                  <span style={{ color: "#9ca3af" }}>한줄 후기 + 별점</span>은 트레이너 상세 페이지에서 누구나 볼 수 있습니다.
                </p>
              </div>
              <div className="h-px" style={{ background: "#2a2a2a" }} />
              <div className="flex items-start gap-2.5">
                <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                  <LockIcon />
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: "#6b7280" }}>
                  <span style={{ color: "#9ca3af" }}>관리자 메모</span>는 운영팀만 확인하며, 외부에 일절 공개되지 않습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 고정 버튼 ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pt-3"
        style={{
          background: "linear-gradient(to top, #1e1e1e 70%, transparent)",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-200"
          style={{
            background: isValid && !submitting ? "#2f80ed" : "#252525",
            color: isValid && !submitting ? "#fff" : "#4b5563",
            cursor: isValid && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 56" />
              </svg>
              등록 중...
            </span>
          ) : (
            <>
              <span>후기 등록하기</span>
              {isValid && <ArrowIcon />}
            </>
          )}
        </button>

        {!isValid && (
          <p className="text-center text-[11.5px] mt-2" style={{ color: "#383838" }}>
            {rating === 0 ? "별점을 선택해 주세요" : "한줄 후기를 입력해 주세요"}
          </p>
        )}
      </div>
    </div>
  );
}

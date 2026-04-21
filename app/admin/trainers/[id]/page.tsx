"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainerById, getReviewsByTrainerId, type Trainer, type Review } from "@/app/data/trainers";

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#ffffff" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="#2F6BFF" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarFilled({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#c9a96e" />
    </svg>
  );
}

/* ── 이니셜 아바타 ── */
function Avatar({ name }: { name: string }) {
  const gradients = [
    "linear-gradient(135deg,#0f1f3d,#2f80ed)",
    "linear-gradient(135deg,#0f2d1a,#34d399)",
    "linear-gradient(135deg,#1f0f3d,#a78bfa)",
    "linear-gradient(135deg,#3d0f0f,#f87171)",
    "linear-gradient(135deg,#2d2d0f,#fbbf24)",
    "linear-gradient(135deg,#0f2d2d,#22d3ee)",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return (
    <div
      className="w-full h-full flex items-center justify-center text-5xl font-bold text-white/80"
      style={{ background: gradients[idx] }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* ── 섹션 레이블 ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
      style={{ color: "#2F6BFF" }}>
      {children}
    </p>
  );
}

/* ── 후기 카드 ── */
function ReviewRow({ review }: { review: Review }) {
  const label =
    review.daysAgo === 0 ? "오늘"
    : review.daysAgo < 7 ? `${review.daysAgo}일 전`
    : review.daysAgo < 30 ? `${Math.floor(review.daysAgo / 7)}주 전`
    : `${Math.floor(review.daysAgo / 30)}개월 전`;
  return (
    <div className="py-3.5 border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((i) => (
            <StarFilled key={i} size={i <= review.rating ? 12 : 10} />
          ))}
          <span className="text-[12px] font-semibold ml-1" style={{ color: "#c9a96e" }}>
            {review.rating}.0
          </span>
        </div>
        <span className="text-[11px]" style={{ color: "#3a3a3a" }}>{label}</span>
      </div>
      <p className="text-[13px] leading-relaxed mb-1" style={{ color: "#c0c0c0" }}>
        &ldquo;{review.comment}&rdquo;
      </p>
      <p className="text-[11.5px]" style={{ color: "#5a5a5a" }}>{review.authorMasked}</p>
    </div>
  );
}

/* ── 로딩 스켈레톤 ── */
function Skeleton() {
  return (
    <div className="min-h-dvh animate-pulse" style={{ background: "#0e0e0e" }}>
      <div className="w-full h-56" style={{ background: "#1a1a1a" }} />
      <div className="px-4 pt-5 flex flex-col gap-3">
        {[1,2,3].map((i) => <div key={i} className="h-10 rounded-xl" style={{ background: "#1a1a1a" }} />)}
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function AdminTrainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null | "loading">("loading");
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getTrainerById(id).then((found) => setTrainer(found ?? null));
    getReviewsByTrainerId(id).then(setReviews);
  }, [id]);

  if (trainer === "loading") return <Skeleton />;
  if (trainer === null) notFound();

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(14,14,14,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/admin/trainers")}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#131313" }}
        >
          <BackIcon />
        </button>
        <span className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>
          트레이너 상세
        </span>
        <Link
          href={`/admin/trainers/${id}/edit`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-opacity active:opacity-80"
          style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}
        >
          <EditIcon />
          수정
        </Link>
      </header>

      {/* ── 프로필 히어로 ── */}
      <div className="relative w-full" style={{ height: 220 }}>
        {trainer.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trainer.profileImage} alt={trainer.name} className="w-full h-full object-cover" />
        ) : (
          <Avatar name={trainer.name} />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, #0e0e0e, transparent)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-0.5"
            style={{ color: "#2F6BFF" }}>
            {trainer.specialty}
          </p>
          <h1 className="text-[24px] font-bold" style={{ color: "#ffffff" }}>
            {trainer.name} 트레이너
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <StarFilled size={13} />
            <span className="text-[13px] font-semibold" style={{ color: "#c9a96e" }}>
              {trainer.ratingAvg.toFixed(1)}
            </span>
            <span style={{ color: "rgba(255,255,255,0.06)" }}>·</span>
            <span className="text-[12px]" style={{ color: "#5a5a5a" }}>후기 {trainer.reviewCount}건</span>
            <span style={{ color: "rgba(255,255,255,0.06)" }}>·</span>
            <span className="text-[12px]" style={{ color: "#5a5a5a" }}>{trainer.careerYears}년차</span>
          </div>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="flex flex-col gap-3 px-4 pt-3 pb-10">

        {/* 한줄 소개 */}
        <div
          className="px-4 py-3.5 rounded-2xl border-l-2"
          style={{ background: "rgba(47,107,255,0.05)", borderColor: "#2F6BFF" }}
        >
          <p className="text-[13.5px] leading-relaxed italic" style={{ color: "#a0a0a0" }}>
            &ldquo;{trainer.shortBio}&rdquo;
          </p>
        </div>

        {/* 소개 */}
        <div className="px-4 py-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <SectionLabel>소개</SectionLabel>
          {trainer.introduction ? (
            <p className="text-[13px] leading-[1.8] whitespace-pre-line" style={{ color: "#b8b8b8" }}>
              {trainer.introduction}
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: "#5a5a5a" }}>등록된 소개글이 없습니다.</p>
          )}
        </div>

        {/* 경력 및 자격 */}
        <div className="px-4 py-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <SectionLabel>경력 및 자격</SectionLabel>
          {trainer.certifications.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {trainer.certifications.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(47,107,255,0.10)" }}
                  >
                    <CheckIcon />
                  </span>
                  <span className="text-[13px] leading-snug" style={{ color: "#b8b8b8" }}>{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px]" style={{ color: "#5a5a5a" }}>등록된 경력·자격 정보가 없습니다.</p>
          )}
        </div>

        {/* 전문 분야 태그 */}
        <div className="px-4 py-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <SectionLabel>전문 분야</SectionLabel>
          {trainer.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trainer.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                  style={{ background: "rgba(47,107,255,0.08)", color: "#2F6BFF" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: "#5a5a5a" }}>등록된 태그가 없습니다.</p>
          )}
        </div>

        {/* 후기 */}
        <div className="px-4 py-4 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>회원 후기</SectionLabel>
            <span className="text-[12px] -mt-3" style={{ color: "#3a3a3a" }}>
              총 {reviews.length}건
            </span>
          </div>
          {reviews.length > 0 ? (
            reviews.map((r) => <ReviewRow key={r.id} review={r} />)
          ) : (
            <p className="text-[13px] py-2" style={{ color: "#5a5a5a" }}>
              아직 등록된 후기가 없습니다.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

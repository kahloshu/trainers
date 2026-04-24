"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackIcon } from "@/app/components/icons";
import { getTrainerById, getReviewsByTrainerId } from "@/app/data/trainers";
import type { Trainer, Review } from "@/app/data/trainers";
import GallerySlider from "@/app/components/GallerySlider";

/* ── 아이콘 ── */
function StarFilled({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#c9a96e" />
    </svg>
  );
}

function StarEmpty({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#383838" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="#2f80ed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M13 6L19 12L13 18" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#FEE500"/>
      <path d="M18 9C12.48 9 8 12.69 8 17.25c0 2.88 1.86 5.42 4.68 6.93l-1.19 4.37 5.13-3.37c.44.07 1.01.12 1.38.12 5.52 0 10-3.69 10-8.25S23.52 9 18 9z" fill="#3C1E1E"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="url(#ig-grad)"/>
      <circle cx="18" cy="18" r="6.5" stroke="white" strokeWidth="2.2"/>
      <circle cx="25" cy="11" r="1.6" fill="white"/>
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#fdf497"/>
          <stop offset="25%" stopColor="#fd5949"/>
          <stop offset="55%" stopColor="#d6249f"/>
          <stop offset="100%" stopColor="#285AEB"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── 이니셜 아바타 ── */
function InitialAvatar({ name }: { name: string }) {
  const gradients = [
    "linear-gradient(135deg, #0f1f3d 0%, #1a4a8a 50%, #2f80ed 100%)",
    "linear-gradient(135deg, #0f2d1a 0%, #1a6a3a 50%, #34d399 100%)",
    "linear-gradient(135deg, #1f0f3d 0%, #4a1a8a 50%, #a78bfa 100%)",
    "linear-gradient(135deg, #3d0f0f 0%, #8a1a1a 50%, #f87171 100%)",
    "linear-gradient(135deg, #2d2d0f 0%, #6a6a1a 50%, #fbbf24 100%)",
    "linear-gradient(135deg, #0f2d2d 0%, #1a6a6a 50%, #22d3ee 100%)",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: gradients[idx] }}>
      <span className="text-7xl font-bold text-white/80 tracking-tight select-none">
        {name.charAt(0)}
      </span>
    </div>
  );
}

/* ── 평점 별 렌더 ── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= Math.round(rating) ? <StarFilled key={i} size={size} /> : <StarEmpty key={i} size={size} />
      )}
    </div>
  );
}

/* ── 섹션 헤더 ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#2f80ed" }}>
      {children}
    </h2>
  );
}

/* ── 후기 카드 ── */
function ReviewCard({ review }: { review: Review }) {
  const daysLabel =
    review.daysAgo === 0
      ? "오늘"
      : review.daysAgo < 7
      ? `${review.daysAgo}일 전`
      : review.daysAgo < 30
      ? `${Math.floor(review.daysAgo / 7)}주 전`
      : `${Math.floor(review.daysAgo / 30)}개월 전`;

  return (
    <div className="py-4 border-b last:border-b-0" style={{ borderColor: "#2f2f2f" }}>
      <div className="flex items-center justify-between mb-2">
        <Stars rating={review.rating} size={12} />
        <span className="text-[11px]" style={{ color: "#6b7280" }}>
          {daysLabel}
        </span>
      </div>
      <p className="text-[13.5px] leading-relaxed" style={{ color: "#d1d5db" }}>
        &ldquo;{review.comment}&rdquo;
      </p>
      <p className="text-[11.5px] mt-2" style={{ color: "#6b7280" }}>
        {review.authorMasked}
      </p>
    </div>
  );
}

/* ── 로딩 스켈레톤 ── */
function LoadingSkeleton() {
  return (
    <div className="min-h-dvh animate-pulse" style={{ background: "#1e1e1e" }}>
      <div className="w-full" style={{ aspectRatio: "1/1", maxHeight: 360, background: "#252525" }} />
      <div className="px-4 pt-6 flex flex-col gap-4">
        <div className="h-4 rounded-full w-1/3" style={{ background: "#2a2a2a" }} />
        <div className="h-3 rounded-full w-2/3" style={{ background: "#2a2a2a" }} />
        <div className="h-3 rounded-full w-1/2" style={{ background: "#2a2a2a" }} />
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function TrainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trainer, setTrainer] = useState<Trainer | null | "loading">("loading");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    getTrainerById(id).then((found) => setTrainer(found ?? null));
    getReviewsByTrainerId(id).then(setReviews);
  }, [id]);

  if (trainer === "loading") return <LoadingSkeleton />;
  if (trainer === null) notFound();

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="min-h-dvh" style={{ background: "#1e1e1e" }}>
      {/* ── 상단 네비 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(30,30,30,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2f2f2f" }}
      >
        <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: "#2a2a2a" }}>
          <BackIcon />
        </Link>
        <span className="text-[15px] font-semibold" style={{ color: "#fbfafa" }}>
          트레이너 소개
        </span>
        <div className="w-9" />
      </header>

      {/* ── 프로필 히어로 ── */}
      <div className="relative w-full" style={{ aspectRatio: "1/1", maxHeight: 360 }}>
        {trainer.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trainer.profileImage} alt={trainer.name} className="w-full h-full object-cover" />
        ) : (
          <InitialAvatar name={trainer.name} />
        )}
        {/* 하단 그라데이션 오버레이 */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to top, #1e1e1e 0%, transparent 100%)" }}
        />
        {/* 이름 오버레이 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase mb-1" style={{ color: "#2f80ed" }}>
            {trainer.specialty}
          </p>
          <h1 className="text-[28px] font-bold tracking-tight leading-tight" style={{ color: "#fbfafa" }}>
            {trainer.name} 트레이너
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Stars rating={trainer.ratingAvg} size={13} />
            <span className="text-[13px] font-semibold" style={{ color: "#c9a96e" }}>
              {trainer.ratingAvg.toFixed(1)}
            </span>
            <span style={{ color: "#6b7280" }}>·</span>
            <span className="text-[13px]" style={{ color: "#6b7280" }}>
              후기 {trainer.reviewCount}건
            </span>
            <span style={{ color: "#6b7280" }}>·</span>
            <span className="text-[13px]" style={{ color: "#6b7280" }}>
              {trainer.careerYears}년차
            </span>
          </div>
        </div>
      </div>

      {/* ── 갤러리 슬라이더 ── */}
      <GallerySlider images={trainer.galleryImages ?? []} />

      {/* ── 본문 (스크롤) ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-32">

        {/* 한줄 소개 */}
        <div
          className="px-4 py-3.5 rounded-2xl border-l-2"
          style={{ background: "rgba(47,128,237,0.06)", borderColor: "#2f80ed" }}
        >
          <p className="text-[14px] leading-relaxed italic" style={{ color: "#9ca3af" }}>
            &ldquo;{trainer.shortBio}&rdquo;
          </p>
        </div>

        {/* 카카오톡 / 인스타그램 */}
        {(trainer.kakaoId || trainer.instagramId) && (
          <div className="section-block flex flex-col gap-3">
            {trainer.kakaoId && (
              <a
                href={trainer.kakaoId.startsWith("http") ? trainer.kakaoId : `kakaotalk://user?id=${trainer.kakaoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <KakaoIcon />
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-0.5" style={{ color: "#5a5a5a" }}>카카오톡</p>
                  <p className="text-[13px]" style={{ color: "#d1d5db" }}>{trainer.kakaoId}</p>
                </div>
              </a>
            )}
            {trainer.instagramId && (
              <a
                href={trainer.instagramId.startsWith("http") ? trainer.instagramId : `https://instagram.com/${trainer.instagramId.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <InstagramIcon />
                <div>
                  <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase mb-0.5" style={{ color: "#5a5a5a" }}>인스타그램</p>
                  <p className="text-[13px]" style={{ color: "#d1d5db" }}>{trainer.instagramId}</p>
                </div>
              </a>
            )}
          </div>
        )}

        {/* 소개 */}
        <div className="section-block">
          <SectionLabel>소개</SectionLabel>
          {trainer.introduction ? (
            <p className="text-[13.5px] leading-[1.75] whitespace-pre-line" style={{ color: "#c9cacc" }}>
              {trainer.introduction}
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: "#6b7280" }}>등록된 소개글이 없습니다.</p>
          )}
        </div>

        {/* 경력 */}
        {(trainer.career?.length ?? 0) > 0 && (
          <div className="section-block">
            <SectionLabel>경력</SectionLabel>
            <ul className="flex flex-col gap-2.5">
              {trainer.career.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(47,128,237,0.12)" }}
                  >
                    <CheckIcon />
                  </span>
                  <span className="text-[13.5px] leading-snug" style={{ color: "#c9cacc" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 자격증 */}
        {trainer.certifications.length > 0 && (
          <div className="section-block">
            <SectionLabel>자격증</SectionLabel>
            <ul className="flex flex-col gap-2.5">
              {trainer.certifications.map((cert, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(47,128,237,0.12)" }}
                  >
                    <CheckIcon />
                  </span>
                  <span className="text-[13.5px] leading-snug" style={{ color: "#c9cacc" }}>
                    {cert}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 전문 분야 */}
        <div className="section-block">
          <SectionLabel>전문 분야</SectionLabel>
          {trainer.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trainer.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-[12.5px] font-medium"
                  style={{ background: "rgba(47,128,237,0.1)", color: "#7ab3f4" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: "#6b7280" }}>등록된 전문 분야 태그가 없습니다.</p>
          )}
        </div>

        {/* 후기 */}
        <div className="section-block">
          <div className="flex items-center justify-between mb-3">
            <div>
              <SectionLabel>회원 후기</SectionLabel>
            </div>
            <div className="flex items-center gap-1.5 -mt-3">
              <StarFilled size={13} />
              <span className="text-[13px] font-semibold" style={{ color: "#c9a96e" }}>
                {trainer.ratingAvg.toFixed(1)}
              </span>
              <span className="text-[12px]" style={{ color: "#6b7280" }}>
                ({trainer.reviewCount})
              </span>
            </div>
          </div>

          {visibleReviews.length > 0 ? (
            <>
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {!showAllReviews && reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="w-full mt-3 py-2.5 rounded-xl text-[13px] font-medium border transition-colors"
                  style={{ borderColor: "#383838", color: "#9ca3af", background: "transparent" }}
                >
                  후기 {reviews.length - 3}개 더 보기
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[13px]" style={{ color: "#6b7280" }}>
                아직 등록된 후기가 없습니다.
              </p>
              <p className="text-[12px] mt-1" style={{ color: "#374151" }}>
                OT를 완료한 회원만 후기를 작성할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 하단 고정 CTA ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 py-4"
        style={{
          background: "linear-gradient(to top, #1e1e1e 60%, transparent)",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <Link
          href={`/trainer/${trainer.id}/apply`}
          className="btn-primary"
          style={{ borderRadius: "6px", padding: "15px 20px" }}
        >
          <span>OT 신청하기</span>
        </Link>
      </div>
    </div>
  );
}

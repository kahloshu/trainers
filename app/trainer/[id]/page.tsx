"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainerById, getReviewsByTrainerId } from "@/app/data/trainers";
import type { Trainer, Review } from "@/app/data/trainers";

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#fbfafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
      <path d="M5 12H19M13 6L19 12L13 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

/* ── 갤러리 슬라이더 + 라이트박스 ── */
function GallerySlider({ images }: { images: string[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [imgW, setImgW]               = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const dragStart  = useRef<{ x: number; scrollLeft: number } | null>(null);
  const didDrag    = useRef(false);

  // 컨테이너 실제 너비로 이미지 크기 계산
  useEffect(() => {
    function measure() {
      if (!wrapperRef.current) return;
      const w = wrapperRef.current.offsetWidth;
      // 16px 왼쪽 패딩 + 2개 gap(8px) → 2.5장 표시
      // 16px 왼쪽 패딩 제외한 너비에서 2.5장 계산
      setImgW(Math.floor((w - 16 - 8 * 2) / 2.5));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ESC / 화살표 키
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     setLightboxIdx(null);
      if (e.key === "ArrowLeft")  setLightboxIdx((p) => (p !== null ? Math.max(0, p - 1) : p));
      if (e.key === "ArrowRight") setLightboxIdx((p) => (p !== null ? Math.min(images.length - 1, p + 1) : p));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, images.length]);

  // 마우스 드래그
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, scrollLeft: scrollRef.current?.scrollLeft ?? 0 };
    didDrag.current = false;
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current || !scrollRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 4) didDrag.current = true;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  }, []);
  const onMouseUp = useCallback(() => { dragStart.current = null; }, []);

  if (images.length === 0) return null;

  return (
    <>
      {/* ── 갤러리 트랙 ── */}
      <div ref={wrapperRef} className="mt-4 mb-1">
        <h2
          className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3 px-4"
          style={{ color: "#2f80ed" }}
        >
          갤러리
        </h2>

        {/* 왼쪽 여백을 주기 위한 wrapper */}
        <div style={{ paddingLeft: "16px" }}>
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              overflowX: "scroll",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
              gap: "8px",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              cursor: "grab",
              userSelect: "none",
            } as React.CSSProperties}
          >
            {imgW > 0 && images.map((url, i) => (
              <div
                key={i}
                onClick={() => { if (!didDrag.current) setLightboxIdx(i); }}
                style={{
                  flex: `0 0 ${imgW}px`,
                  width: `${imgW}px`,
                  height: `${imgW}px`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  scrollSnapAlign: "start",
                  cursor: "pointer",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`갤러리 ${i + 1}`}
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                />
              </div>
            ))}
            <div style={{ flexShrink: 0, width: "8px" }} />
          </div>
        </div>
      </div>

      {/* ── 라이트박스 ── */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* 카운터 */}
          <div style={{
            position: "absolute", top: "18px", left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.55)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em",
          }}>
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* 닫기 */}
          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: "absolute", top: "14px", right: "14px",
              width: "38px", height: "38px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* 이전 */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
              style={{
                position: "absolute", left: "12px",
                width: "44px", height: "44px", borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", cursor: "pointer", fontSize: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ‹
            </button>
          )}

          {/* 다음 */}
          {lightboxIdx < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
              style={{
                position: "absolute", right: "12px",
                width: "44px", height: "44px", borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", cursor: "pointer", fontSize: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ›
            </button>
          )}

          {/* 이미지 */}
          <div
            onClick={() => setLightboxIdx(null)}
            style={{ borderRadius: "16px", overflow: "hidden", maxWidth: "90vw", maxHeight: "80vh" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIdx]}
              alt={`갤러리 ${lightboxIdx + 1}`}
              style={{ display: "block", maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
            />
          </div>

          {/* 하단 점 인디케이터 */}
          {images.length > 1 && (
            <div style={{ position: "absolute", bottom: "24px", display: "flex", gap: "6px" }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                  style={{
                    width: i === lightboxIdx ? "20px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === lightboxIdx ? "#fff" : "rgba(255,255,255,0.3)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
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

  useEffect(() => {
    getTrainerById(id).then((found) => setTrainer(found ?? null));
    getReviewsByTrainerId(id).then(setReviews);
  }, [id]);

  if (trainer === "loading") return <LoadingSkeleton />;
  if (trainer === null) notFound();

  const previewReviews = reviews.slice(0, 3);

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

        {/* 경력 및 자격 */}
        <div className="section-block">
          <SectionLabel>경력 및 자격</SectionLabel>
          {trainer.certifications.length > 0 ? (
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
          ) : (
            <p className="text-[13px]" style={{ color: "#6b7280" }}>등록된 경력·자격 정보가 없습니다.</p>
          )}
        </div>

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

          {previewReviews.length > 0 ? (
            <>
              {previewReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {reviews.length > 3 && (
                <button
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
          style={{ borderRadius: "14px", padding: "15px 20px" }}
        >
          <span>OT 신청하기</span>
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

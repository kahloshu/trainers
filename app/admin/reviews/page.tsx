"use client";

import { useState, useEffect } from "react";
import type { Review } from "@/app/data/trainers";

function StarFilled({ color = "#c9a96e" }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
    </svg>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const label = review.daysAgo === 0 ? "오늘"
    : review.daysAgo < 7 ? `${review.daysAgo}일 전`
    : review.daysAgo < 30 ? `${Math.floor(review.daysAgo / 7)}주 전`
    : `${Math.floor(review.daysAgo / 30)}달 전`;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border"
      style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((i) => (
            <StarFilled key={i} color={i <= review.rating ? "#c9a96e" : "#1f1f1f"} />
          ))}
          <span className="ml-1.5 text-[13px] font-bold" style={{ color: "#c9a96e" }}>
            {review.rating}.0
          </span>
        </div>
        <span className="text-[11px]" style={{ color: "#3a3a3a" }}>{label}</span>
      </div>
      <p className="text-[13.5px] leading-relaxed italic" style={{ color: "#a0a0a0" }}>
        &ldquo;{review.comment}&rdquo;
      </p>
      <p className="text-[12px]" style={{ color: "#5a5a5a" }}>{review.authorMasked}</p>
    </div>
  );
}

export default function TrainerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trainer/reviews")
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews ?? []); setLoading(false); });
  }, []);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-dvh pb-24" style={{ background: "#0e0e0e" }}>

      <header className="sticky top-0 z-40 px-4 pt-5 pb-4"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "#2F6BFF" }}>MY</p>
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>내 후기</h1>
          <div className="flex items-center gap-1.5">
            <StarFilled />
            <span className="text-[15px] font-bold" style={{ color: "#c9a96e" }}>{avgRating}</span>
            <span className="text-[12px]" style={{ color: "#3a3a3a" }}>({reviews.length}개)</span>
          </div>
        </div>
      </header>

      <main className="px-4 pt-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            <p className="text-center text-[12px] py-4" style={{ color: "#131313" }}>
              — 모두 확인했습니다 —
            </p>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-[14px]" style={{ color: "#2a2a2a" }}>아직 후기가 없습니다.</p>
          </div>
        )}
      </main>
    </div>
  );
}

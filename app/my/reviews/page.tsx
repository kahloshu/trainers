"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getReviewsByPhone, getTrainerById, type Review, type Trainer } from "@/app/data/trainers";
import BottomNav from "@/app/components/BottomNav";

const STORAGE_KEY = "jg_my_phone";

const STAR_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#2f80ed"];

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= rating ? (STAR_COLORS[rating] ?? "#c9a96e") : "#2a2a2a"}
            stroke={i <= rating ? (STAR_COLORS[rating] ?? "#c9a96e") : "#383838"}
            strokeWidth="0.5"
          />
        </svg>
      ))}
      <span className="ml-1.5 text-[12px] font-semibold" style={{ color: STAR_COLORS[rating] ?? "#c9a96e" }}>
        {rating}.0
      </span>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#fbfafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatDaysAgo(days: number) {
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

type ReviewWithTrainer = Review & { trainerName: string; trainerSpecialty: string };

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewWithTrainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const phone = localStorage.getItem(STORAGE_KEY);
    if (!phone) { router.replace("/my"); return; }

    (async () => {
      const raw = await getReviewsByPhone(phone);
      const withTrainer = await Promise.all(
        raw.map(async (r) => {
          const t = await getTrainerById(r.trainerId);
          return {
            ...r,
            trainerName:      t?.name ?? "알 수 없음",
            trainerSpecialty: t?.specialty ?? "",
          };
        })
      );
      setReviews(withTrainer);
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: "#1a1a1a" }}
        >
          <BackIcon />
        </button>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: "#2F6BFF" }}>MY</p>
          <h1 className="text-[17px] font-bold tracking-tight leading-none mt-0.5" style={{ color: "#ffffff" }}>내 후기</h1>
        </div>
      </header>

      <main className="page-scroll pb-28 px-4 pt-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#141414" }} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center pt-20 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(47,107,255,0.08)" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="#2F6BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>작성한 후기가 없습니다</p>
            <p className="text-[13px] text-center leading-relaxed" style={{ color: "#5a5a5a" }}>
              OT 완료 후 트레이너 상세 페이지에서<br />후기를 작성할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl p-4"
                style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>
                      {r.trainerName} 트레이너
                    </p>
                    {r.trainerSpecialty && (
                      <p className="text-[12px] mt-0.5" style={{ color: "#5a5a5a" }}>{r.trainerSpecialty}</p>
                    )}
                  </div>
                  <p className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: "#3a3a3a" }}>
                    {formatDaysAgo(r.daysAgo)}
                  </p>
                </div>

                <StarDisplay rating={r.rating} />

                <p
                  className="mt-3 text-[13px] leading-relaxed"
                  style={{ color: "#9ca3af" }}
                >
                  {r.comment}
                </p>

                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/my/review/${r.trainerId}`}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-xl transition-opacity active:opacity-70"
                    style={{ background: "rgba(47,107,255,0.10)", color: "#2F6BFF" }}
                  >
                    수정
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

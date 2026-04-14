"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllReviews, getAllTrainers, deleteReview, type Review, type Trainer } from "@/app/data/trainers";
import DashboardFilter, { EMPTY_FILTER, type FilterState } from "../components/DashboardFilter";

/* ── 별 렌더 ── */
function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= rating ? "#c9a96e" : "rgba(255,255,255,0.06)"}
            stroke={i <= rating ? "#c9a96e" : "rgba(255,255,255,0.08)"}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
}

/* ── 삭제 모달 ── */
function DeleteModal({
  review,
  trainerName,
  loading,
  onConfirm,
  onCancel,
}: {
  review: Review;
  trainerName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[400px] rounded-2xl p-6 mx-4"
        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h3 className="text-[16px] font-bold mb-1.5" style={{ color: "#ffffff" }}>후기 삭제</h3>
        <p className="text-[13px] mb-3" style={{ color: "#5a5a5a" }}>
          <span style={{ color: "#a0a0a0" }}>{trainerName}</span> 트레이너의 후기를 삭제하시겠습니까?
        </p>
        <div
          className="px-4 py-3 rounded-xl mb-5 text-[13px] leading-relaxed italic"
          style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.12)", color: "#a0a0a0" }}
        >
          &ldquo;{review.comment.slice(0, 80)}{review.comment.length > 80 ? "…" : ""}&rdquo;
        </div>
        <div className="flex gap-2.5">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-[13.5px] font-medium"
            style={{ background: "#141414", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
            취소
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-xl text-[13.5px] font-semibold disabled:opacity-50"
            style={{ background: "#f87171", color: "#fff" }}>
            {loading ? "삭제 중…" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 토스트 ── */
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-[13px] font-semibold shadow-xl"
      style={{ background: "#34d399", color: "#fff" }}>
      {message}
    </div>
  );
}

/* ── 평점 필터 칩 ── */
const RATING_CHIPS = [
  { value: "5", label: "★ 5점" },
  { value: "4", label: "★ 4점" },
  { value: "3", label: "★ 3점" },
  { value: "2", label: "★ 2점" },
  { value: "1", label: "★ 1점" },
];

/* ── 페이지 ── */
export default function DashboardReviewsPage() {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterState>(EMPTY_FILTER);
  const [trainerFilter, setTrainerFilter] = useState("");
  const [ratingFilter, setRatingFilter]   = useState("");
  const [deleteTarget, setDeleteTarget]   = useState<Review | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]       = useState("");

  useEffect(() => {
    Promise.all([getAllReviews(), getAllTrainers()]).then(([r, t]) => {
      setReviews(r);
      setTrainers(t);
      setLoading(false);
    });
  }, []);

  /* 트레이너 이름 맵 */
  const trainerMap = useMemo(() =>
    Object.fromEntries(trainers.map((t) => [t.id, t.name])),
    [trainers]
  );

  /* 필터링 */
  const filtered = useMemo(() => {
    let result = reviews;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((r) =>
        r.comment.toLowerCase().includes(q) ||
        r.authorMasked.toLowerCase().includes(q) ||
        (trainerMap[r.trainerId] ?? "").toLowerCase().includes(q)
      );
    }
    if (trainerFilter) result = result.filter((r) => r.trainerId === trainerFilter);
    if (ratingFilter)  result = result.filter((r) => r.rating === Number(ratingFilter));
    return result;
  }, [reviews, filter, trainerFilter, ratingFilter, trainerMap]);

  /* 평균 평점 */
  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  /* 평점 분포 */
  const ratingDist = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
    return dist;
  }, [reviews]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteReview(deleteTarget.id);
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteLoading(false);
    setDeleteTarget(null);
    showToast("후기가 삭제되었습니다.");
  }

  const hasFilter = filter.search !== "" || trainerFilter !== "" || ratingFilter !== "";

  return (
    <div className="p-6">

      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold" style={{ color: "#ffffff" }}>후기 관리</h2>
        <p className="text-[13px] mt-0.5" style={{ color: "#3a3a3a" }}>전체 {reviews.length}건</p>
      </div>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-5">
        {/* 평균 평점 */}
        <div className="rounded-2xl p-5 col-span-2 lg:col-span-1"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[12px] mb-2" style={{ color: "#5a5a5a" }}>전체 평균 평점</p>
          <div className="flex items-end gap-2">
            <p className="text-[32px] font-bold leading-none" style={{ color: "#c9a96e" }}>
              {avgRating.toFixed(1)}
            </p>
            <div className="mb-1">
              <Stars rating={Math.round(avgRating)} size={14} />
            </div>
          </div>
        </div>

        {/* 평점 분포 */}
        <div className="rounded-2xl p-5 col-span-2 lg:col-span-3"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[12px] mb-3" style={{ color: "#5a5a5a" }}>평점 분포</p>
          <div className="flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDist[star] ?? 0;
              const pct   = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[11.5px] w-4 text-right flex-shrink-0" style={{ color: "#5a5a5a" }}>{star}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill="#c9a96e" />
                  </svg>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "#c9a96e", opacity: 0.75 }} />
                  </div>
                  <span className="text-[11.5px] w-6 text-right flex-shrink-0" style={{ color: "#3a3a3a" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-col gap-2.5 mb-4">
        <DashboardFilter
          value={filter}
          onChange={setFilter}
          searchPlaceholder="후기 내용, 작성자, 트레이너 검색…"
        />

        {/* 트레이너 + 평점 필터 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 트레이너 선택 */}
          <select
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-[12.5px] outline-none"
            style={{
              background: trainerFilter ? "rgba(142,171,255,0.10)" : "#141414",
              border: `1px solid ${trainerFilter ? "rgba(142,171,255,0.25)" : "rgba(255,255,255,0.05)"}`,
              color: trainerFilter ? "#8eabff" : "#5a5a5a",
            }}
          >
            <option value="">전체 트레이너</option>
            {trainers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* 평점 칩 */}
          {RATING_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setRatingFilter(ratingFilter === chip.value ? "" : chip.value)}
              className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
              style={{
                background: ratingFilter === chip.value ? "rgba(201,169,110,0.12)" : "#141414",
                color:      ratingFilter === chip.value ? "#c9a96e" : "#5a5a5a",
                border:     `1px solid ${ratingFilter === chip.value ? "rgba(201,169,110,0.25)" : "rgba(255,255,255,0.05)"}`,
              }}
            >
              {chip.label}
            </button>
          ))}

          {hasFilter && (
            <button
              onClick={() => { setFilter(EMPTY_FILTER); setTrainerFilter(""); setRatingFilter(""); }}
              className="px-3 py-1.5 rounded-xl text-[12.5px] font-medium"
              style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.12)" }}
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 후기 목록 */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>

        {/* 컬럼 헤더 */}
        <div className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "140px 80px 1fr 100px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
          {["트레이너", "평점", "후기 내용", ""].map((h, i) => (
            <span key={i} className="text-[11px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: "#3a3a3a" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-6 flex flex-col gap-3 animate-pulse">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-16 rounded-xl" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px]" style={{ color: "#3a3a3a" }}>
              {reviews.length === 0 ? "등록된 후기가 없습니다." : "검색 결과가 없습니다."}
            </p>
          </div>
        ) : (
          filtered.map((review) => {
            const trainerName = trainerMap[review.trainerId] ?? "알 수 없음";
            const daysLabel =
              review.daysAgo === 0 ? "오늘"
              : review.daysAgo < 7 ? `${review.daysAgo}일 전`
              : review.daysAgo < 30 ? `${Math.floor(review.daysAgo / 7)}주 전`
              : `${Math.floor(review.daysAgo / 30)}개월 전`;

            return (
              <div
                key={review.id}
                className="grid items-start px-5 py-4 transition-colors"
                style={{
                  gridTemplateColumns: "140px 80px 1fr 100px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                {/* 트레이너 */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ background: "#1f1f1f", color: "#8eabff" }}>
                    {trainerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium leading-tight" style={{ color: "#ffffff" }}>{trainerName}</p>
                    <p className="text-[11px]" style={{ color: "#3a3a3a" }}>{review.authorMasked}</p>
                  </div>
                </div>

                {/* 평점 */}
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <Stars rating={review.rating} size={11} />
                  <span className="text-[12px] font-semibold" style={{ color: "#c9a96e" }}>
                    {review.rating}.0
                  </span>
                </div>

                {/* 후기 내용 */}
                <div className="pr-4">
                  <p className="text-[13px] leading-relaxed" style={{ color: "#b0b0b0" }}>
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "#3a3a3a" }}>{daysLabel}</p>
                </div>

                {/* 삭제 버튼 */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setDeleteTarget(review)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                    style={{ background: "#1a1a1a", color: "#3a3a3a", border: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.10)";
                      (e.currentTarget as HTMLElement).style.color = "#f87171";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
                      (e.currentTarget as HTMLElement).style.color = "#3a3a3a";
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 결과 수 */}
      {!loading && filtered.length > 0 && (
        <p className="text-[12px] mt-3" style={{ color: "#2a2a2a" }}>
          {filtered.length}건 표시 중 (전체 {reviews.length}건)
        </p>
      )}

      {/* 삭제 모달 */}
      {deleteTarget && (
        <DeleteModal
          review={deleteTarget}
          trainerName={trainerMap[deleteTarget.trainerId] ?? "알 수 없음"}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* 토스트 */}
      {toast && <Toast message={toast} />}
    </div>
  );
}

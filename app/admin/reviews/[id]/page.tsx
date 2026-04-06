"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { REVIEWS, TRAINERS } from "@/app/data/trainers";

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#ffffff" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GlobeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#8eabff" strokeWidth="1.6" />
      <path d="M12 3c-2 3-2 15 0 18M12 3c2 3 2 15 0 18M3 12h18"
        stroke="#8eabff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon({ size = 14, color = "#f59e0b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="1.6" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── 별점 ── */
function StarRow({ rating, size = 20 }: { rating: number; size?: number }) {
  const COLORS = ["", "#f87171", "#f97316", "#eab308", "#22c55e", "#8eabff"];
  const color = COLORS[rating] ?? "#c9a96e";
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={i <= rating ? color : "#131313"}
          />
        </svg>
      ))}
      <span className="text-[15px] font-bold ml-1" style={{ color }}>
        {rating}.0
      </span>
    </div>
  );
}

/* ── 날짜 레이블 ── */
function daysLabel(daysAgo: number) {
  if (daysAgo === 0) return "오늘";
  if (daysAgo < 7)  return `${daysAgo}일 전`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}주 전`;
  return `${Math.floor(daysAgo / 30)}개월 전`;
}

/* ── 섹션 블록 ── */
function Block({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
      {children}
    </div>
  );
}
function BlockHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      {children}
    </div>
  );
}
function InfoRow({ label, value, last = false }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 py-3.5 px-5">
        <span className="text-[13px] flex-shrink-0" style={{ color: "#5a5a5a" }}>{label}</span>
        <span className="text-[13px] font-medium text-right leading-snug" style={{ color: "#ffffff" }}>{value}</span>
      </div>
      {!last && <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.04)" }} />}
    </>
  );
}

/* ── 이니셜 아바타 ── */
function MiniAvatar({ name }: { name: string }) {
  const colors = ["#1a4a8a","#1a6a3a","#4a1a8a","#8a1a1a","#6a6a1a","#1a6a6a"];
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
      style={{ background: colors[name.charCodeAt(0) % colors.length] }}>
      {name.charAt(0)}
    </div>
  );
}

/* ── 토스트 ── */
function Toast({ message, color = "#34d399" }: { message: string; color?: string }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-lg pointer-events-none"
      style={{ background: color, color: "#fff", whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}

/* ── 확인 모달 (바텀 시트) ── */
function ConfirmSheet({
  title,
  desc,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  desc: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[480px] rounded-t-3xl p-6 pb-10"
        style={{ background: "#1a1a1a", border: "1px solid #1f1f1f" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#262626" }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "#ffffff" }}>{title}</h3>
        <p className="text-[13px] leading-relaxed mb-7" style={{ color: "#5a5a5a" }}>{desc}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ background: "#131313", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
            취소
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold"
            style={{ background: confirmColor, color: "#fff" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params);
  const router    = useRouter();
  const found     = REVIEWS.find((r) => r.id === id);
  if (!found) notFound();

  const trainer   = TRAINERS.find((t) => t.id === found.trainerId);
  const [visible, setVisible]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; color: string } | null>(null);

  function fireToast(msg: string, color = "#34d399") {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2000);
  }

  function handleToggle() {
    if (visible) {
      setShowModal(true);
    } else {
      setVisible(true);
      fireToast("후기가 공개 복원되었습니다.");
    }
  }

  function confirmHide() {
    setVisible(false);
    setShowModal(false);
    fireToast("비공개 처리되었습니다.", "#a0a0a0");
  }

  /* 별점 라벨 */
  const RATING_LABEL = ["", "아쉬웠습니다.", "조금 아쉬웠습니다.", "보통이었습니다.", "만족스러웠습니다.", "매우 만족스러웠습니다."];
  const RATING_COLOR = ["", "#f87171", "#f97316", "#eab308", "#22c55e", "#8eabff"];

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#131313" }}>
          <BackIcon />
        </button>
        <span className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>후기 상세</span>
        <div className="w-9" />
      </header>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-36">

        {/* ── 노출 상태 배너 ── */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
          style={{
            background: visible ? "rgba(142,171,255,0.07)" : "rgba(90,90,90,0.07)",
            border: `1px solid ${visible ? "rgba(142,171,255,0.18)" : "rgba(90,90,90,0.18)"}`,
          }}
        >
          <span style={{ color: visible ? "#8eabff" : "#5a5a5a" }}>
            {visible ? <GlobeIcon size={15} /> : <LockIcon size={15} color="#5a5a5a" />}
          </span>
          <p className="text-[12.5px] font-medium flex-1" style={{ color: visible ? "#8eabff" : "#5a5a5a" }}>
            {visible
              ? "현재 트레이너 상세 페이지에 공개 중입니다."
              : "비공개 처리됨 — 외부에서 노출되지 않습니다."}
          </p>
        </div>

        {/* ── 작성자 + 트레이너 ── */}
        <Block>
          <BlockHeader>
            <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>
              후기 정보
            </p>
          </BlockHeader>
          <InfoRow label="작성자"   value={found.authorMasked} />
          <InfoRow label="작성일"   value={daysLabel(found.daysAgo)} />
          <InfoRow label="신청번호" value={<span style={{ color: "#5a5a5a" }}>연결된 신청 건</span>} last />
        </Block>

        {/* ── 신청 트레이너 ── */}
        {trainer && (
          <Block>
            <BlockHeader>
              <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>
                대상 트레이너
              </p>
            </BlockHeader>
            <div className="flex items-center gap-3 px-5 py-4">
              <MiniAvatar name={trainer.name} />
              <div>
                <p className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>
                  {trainer.name} 트레이너
                </p>
                <p className="text-[12px] mt-0.5" style={{ color: "#5a5a5a" }}>
                  {trainer.specialty} · {trainer.careerYears}년차
                </p>
              </div>
            </div>
          </Block>
        )}

        {/* ── 공개 후기 ── */}
        <Block>
          <BlockHeader>
            <GlobeIcon size={13} />
            <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>
              공개 후기
            </p>
            <span
              className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(142,171,255,0.10)", color: "#8eabff" }}
            >
              외부 노출
            </span>
          </BlockHeader>

          <div className="px-5 py-5 flex flex-col gap-4">
            {/* 별점 */}
            <div className="flex flex-col gap-2">
              <StarRow rating={found.rating} size={22} />
              <p className="text-[13px] font-medium" style={{ color: RATING_COLOR[found.rating] }}>
                {RATING_LABEL[found.rating]}
              </p>
            </div>

            {/* 구분선 */}
            <div className="h-px" style={{ background: "rgba(255,255,255,0.04)" }} />

            {/* 후기 내용 */}
            <div
              className="px-4 py-3.5 rounded-xl"
              style={{
                background: "#0e0e0e",
                border: "1px solid rgba(255,255,255,0.04)",
                opacity: visible ? 1 : 0.45,
              }}
            >
              <p className="text-[14px] leading-relaxed italic" style={{ color: "#c0c0c0" }}>
                &ldquo;{found.comment}&rdquo;
              </p>
            </div>

            {/* 비공개 시 워터마크 */}
            {!visible && (
              <div className="flex items-center justify-center gap-2">
                <LockIcon size={12} color="#3a3a3a" />
                <span className="text-[11.5px]" style={{ color: "#3a3a3a" }}>
                  비공개 처리로 인해 숨겨진 상태입니다.
                </span>
              </div>
            )}
          </div>
        </Block>

        {/* ── 비공개 메모 ── */}
        <Block>
          <BlockHeader>
            <LockIcon size={13} />
            <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>
              비공개 메모
            </p>
            <span
              className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}
            >
              관리자 전용
            </span>
          </BlockHeader>

          <div className="px-5 py-4">
            {found.rating <= 3 ? (
              /* 낮은 별점 후기는 비공개 메모 있다고 가정 */
              <div className="flex flex-col gap-3">
                <div
                  className="px-4 py-3.5 rounded-xl"
                  style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}
                >
                  <p className="text-[13.5px] leading-relaxed" style={{ color: "#a0a0a0" }}>
                    {found.rating === 1
                      ? "시설 샤워실 온수가 잘 안 나왔습니다. 개선 부탁드려요."
                      : found.rating === 2
                      ? "수업 시간이 예고 없이 변경되어 불편했습니다."
                      : "기대했던 것보다 강도가 낮았습니다. 다음엔 미리 말씀 드릴게요."}
                  </p>
                </div>
                <p className="text-[11px]" style={{ color: "#3a3a3a" }}>
                  이 내용은 관리자만 확인할 수 있으며 외부에 공개되지 않습니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "#131313" }}
                >
                  <LockIcon size={16} color="rgba(255,255,255,0.06)" />
                </div>
                <p className="text-[12.5px]" style={{ color: "#3a3a3a" }}>
                  비공개 메모가 없습니다.
                </p>
              </div>
            )}
          </div>
        </Block>

        {/* ── 노출 관리 ── */}
        <Block>
          <BlockHeader>
            <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>
              노출 관리
            </p>
          </BlockHeader>

          <div className="p-4 flex flex-col gap-3">
            {/* 현재 상태 설명 */}
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{
                background: visible ? "rgba(142,171,255,0.06)" : "rgba(90,90,90,0.06)",
                border: `1px solid ${visible ? "rgba(142,171,255,0.10)" : "rgba(90,90,90,0.10)"}`,
              }}
            >
              <span className="mt-0.5" style={{ color: visible ? "#8eabff" : "#5a5a5a" }}>
                {visible ? <EyeIcon /> : <EyeOffIcon />}
              </span>
              <div>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: visible ? "#8eabff" : "#a0a0a0" }}>
                  {visible ? "공개 중" : "비공개"}
                </p>
                <p className="text-[12px] leading-snug" style={{ color: "#3a3a3a" }}>
                  {visible
                    ? "트레이너 상세 페이지에서 누구나 볼 수 있습니다."
                    : "비공개 처리 상태로, 트레이너 페이지에서 숨겨져 있습니다."}
                </p>
              </div>
            </div>

            {/* 토글 버튼 */}
            <button
              onClick={handleToggle}
              className="w-full py-3.5 rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{
                background: visible ? "#1a1a1a" : "rgba(142,171,255,0.12)",
                color:      visible ? "#a0a0a0" : "#8eabff",
                border:     `1px solid ${visible ? "rgba(255,255,255,0.06)" : "rgba(142,171,255,0.3)"}`,
              }}
            >
              {visible ? <><EyeOffIcon /> 비공개 처리</> : <><EyeIcon /> 공개 복원</>}
            </button>

            <p className="text-[11.5px] text-center" style={{ color: "rgba(255,255,255,0.06)" }}>
              {visible
                ? "비공개 처리해도 데이터는 삭제되지 않습니다."
                : "언제든지 다시 공개로 복원할 수 있습니다."}
            </p>
          </div>
        </Block>

      </div>

      {/* ── 확인 모달 ── */}
      {showModal && (
        <ConfirmSheet
          title="이 후기를 비공개 처리하시겠습니까?"
          desc="비공개 처리 시 트레이너 상세 페이지에서 숨겨집니다. 데이터는 삭제되지 않으며, 언제든지 복원할 수 있습니다."
          confirmLabel="비공개 처리"
          confirmColor="#5a5a5a"
          onConfirm={confirmHide}
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && <Toast message={toast.msg} color={toast.color} />}

    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getAllTrainers, deleteTrainer, toggleFeatured } from "@/app/data/trainers";
import type { Trainer } from "@/app/data/trainers";
import AdminBottomNav from "@/app/admin/components/AdminBottomNav";

/* ── 탭 ── */
const TABS = [
  { id: "all",      label: "전체"   },
  { id: "active",   label: "노출 중" },
  { id: "inactive", label: "비활성" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ── 로컬 상태용 타입 ── */
type TrainerWithState = Trainer & { isActive: boolean; isFeatured: boolean };

/* ── 아이콘 ── */
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="#3a3a3a" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#c9a96e" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2.4 6.4L21 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.6-.87L12 2z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}

/* ── 이니셜 아바타 ── */
function Avatar({ name, size = 52 }: { name: string; size?: number }) {
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
      className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: gradients[idx], fontSize: size * 0.38 }}
    >
      {name.charAt(0)}
    </div>
  );
}


/* ── 확인 모달 ── */
function ConfirmSheet({
  name,
  isActive,
  onConfirm,
  onCancel,
}: {
  name: string;
  isActive: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[480px] rounded-t-3xl p-6"
        style={{ background: "#1a1a1a", border: "1px solid #1f1f1f", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom) + 72px)" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#262626" }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "#ffffff" }}>
          {isActive ? `${name} 트레이너를 비활성화할까요?` : `${name} 트레이너를 노출 복원할까요?`}
        </h3>
        <p className="text-[13px] leading-relaxed mb-7" style={{ color: "#5a5a5a" }}>
          {isActive
            ? "비활성화하면 회원 리스트에서 숨겨집니다. 언제든지 다시 노출할 수 있습니다."
            : "노출 복원하면 회원 리스트에 다시 표시됩니다."}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ background: "#131313", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold"
            style={{
              background: isActive ? "rgba(255,255,255,0.06)" : "#156aff",
              color: isActive ? "#a0a0a0" : "#fff",
            }}
          >
            {isActive ? "비활성화" : "노출 복원"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 삭제 확인 모달 ── */
function DeleteSheet({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[480px] rounded-t-3xl p-6"
        style={{ background: "#1a1a1a", border: "1px solid #1f1f1f", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom) + 72px)" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#262626" }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "#ffffff" }}>
          {name} 트레이너를 삭제할까요?
        </h3>
        <p className="text-[13px] leading-relaxed mb-7" style={{ color: "#5a5a5a" }}>
          삭제하면 해당 트레이너 정보가 완전히 제거됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ background: "#131313", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold"
            style={{ background: "#f87171", color: "#fff" }}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 토스트 ── */
function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-lg pointer-events-none"
      style={{ background: "#34d399", color: "#fff", whiteSpace: "nowrap" }}
    >
      {message}
    </div>
  );
}

/* ── 트레이너 카드 ── */
function TrainerCard({
  trainer,
  onToggle,
  onDelete,
  onFeature,
}: {
  trainer: TrainerWithState;
  onToggle: (t: TrainerWithState) => void;
  onDelete: (t: TrainerWithState) => void;
  onFeature: (t: TrainerWithState) => void;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-opacity"
      style={{
        background: "#1a1a1a",
        borderColor: "rgba(255,255,255,0.04)",
        opacity: trainer.isActive ? 1 : 0.6,
      }}
    >
      <div className="p-4 flex gap-3.5">
        {/* 아바타 */}
        <Avatar name={trainer.name} />

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          {/* 이름 + 상태 뱃지 */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[15px] font-semibold truncate" style={{ color: "#ffffff" }}>
              {trainer.name} 트레이너
            </span>
            {trainer.isFeatured && (
              <span
                className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24" }}
              >
                ★ 상위 노출
              </span>
            )}
            <span
              className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: trainer.isActive ? "rgba(52,211,153,0.10)" : "rgba(90,90,90,0.10)",
                color: trainer.isActive ? "#34d399" : "#5a5a5a",
              }}
            >
              {trainer.isActive ? "노출 중" : "비활성"}
            </span>
          </div>

          {/* 전문 분야 + 경력 */}
          <p className="text-[12.5px] mb-1.5" style={{ color: "#5a5a5a" }}>
            {trainer.specialty} · {trainer.careerYears}년차
          </p>

          {/* 평점 + 후기 수 */}
          <div className="flex items-center gap-1.5">
            <StarIcon />
            <span className="text-[12px] font-semibold" style={{ color: "#c9a96e" }}>
              {trainer.ratingAvg.toFixed(1)}
            </span>
            <span className="text-[11px]" style={{ color: "#3a3a3a" }}>
              · 후기 {trainer.reviewCount}건
            </span>
          </div>

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {trainer.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(142,171,255,0.08)", color: "#8eabff" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 카드 하단 액션 — 상위 노출 */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <span className="text-[12px]" style={{ color: "#5a5a5a" }}>상위 노출</span>
        <button
          onClick={() => onFeature(trainer)}
          className="relative flex-shrink-0 transition-all duration-200"
          style={{ width: 44, height: 26 }}
          aria-label="상위 노출 토글"
        >
          <span
            className="absolute inset-0 rounded-full transition-colors duration-200"
            style={{ background: trainer.isFeatured ? "#fbbf24" : "#262626" }}
          />
          <span
            className="absolute top-[3px] rounded-full transition-all duration-200"
            style={{
              width: 20, height: 20,
              background: "#fff",
              left: trainer.isFeatured ? 21 : 3,
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </button>
      </div>

      {/* 카드 하단 액션 */}
      <div className="flex border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {/* 수정 */}
        <Link
          href={`/admin/trainers/${trainer.id}/edit`}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
          style={{ color: "#a0a0a0" }}
        >
          <EditIcon />
          수정
        </Link>

        <div className="w-px" style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* 노출/비활성 토글 */}
        <button
          onClick={() => onToggle(trainer)}
          className="flex flex-1 items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
          style={{ color: trainer.isActive ? "#5a5a5a" : "#34d399" }}
        >
          {trainer.isActive ? <><EyeOffIcon />비활성화</> : <><EyeIcon />노출 복원</>}
        </button>

        <div className="w-px" style={{ background: "rgba(255,255,255,0.04)" }} />

        {/* 삭제 */}
        <button
          onClick={() => onDelete(trainer)}
          className="flex items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
          style={{ color: "#f87171" }}
        >
          <TrashIcon />
          삭제
        </button>
      </div>
    </div>
  );
}

/* ── 빈 상태 ── */
function EmptyState({ tab }: { tab: TabId }) {
  const msg: Record<TabId, string> = {
    all:      "등록된 트레이너가 없습니다.",
    active:   "노출 중인 트레이너가 없습니다.",
    inactive: "비활성화된 트레이너가 없습니다.",
  };
  return (
    <div
      className="flex flex-col items-center justify-center py-16 rounded-2xl"
      style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ background: "rgba(142,171,255,0.07)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="#3a3a3a" strokeWidth="1.6" />
          <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
            stroke="#3a3a3a" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[13px]" style={{ color: "#3a3a3a" }}>{msg[tab]}</p>
    </div>
  );
}

/* ── 페이지 ── */
export default function AdminTrainersPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [trainers, setTrainers] = useState<TrainerWithState[]>([]);
  const [pending, setPending] = useState<TrainerWithState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TrainerWithState | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getAllTrainers().then((list) =>
      setTrainers(list.map((t: Trainer) => ({ ...t, isActive: true, isFeatured: t.featured ?? false })))
    );
  }, []);

  /* 탭별 카운트 */
  const counts = useMemo(() => ({
    all:      trainers.length,
    active:   trainers.filter((t) => t.isActive).length,
    inactive: trainers.filter((t) => !t.isActive).length,
  }), [trainers]);

  /* 필터 */
  const filtered = useMemo(() => {
    if (activeTab === "active")   return trainers.filter((t) => t.isActive);
    if (activeTab === "inactive") return trainers.filter((t) => !t.isActive);
    return trainers;
  }, [trainers, activeTab]);

  /* 토글 확인 */
  function handleToggle(trainer: TrainerWithState) {
    setPending(trainer);
  }

  /* 토글 실행 */
  function confirmToggle() {
    if (!pending) return;
    setTrainers((prev) =>
      prev.map((t) => t.id === pending.id ? { ...t, isActive: !t.isActive } : t)
    );
    const msg = pending.isActive
      ? `${pending.name} 트레이너가 비활성화되었습니다.`
      : `${pending.name} 트레이너가 노출 복원되었습니다.`;
    setPending(null);
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  /* 상위 노출 토글 */
  async function handleFeature(trainer: TrainerWithState) {
    await toggleFeatured(trainer.id);
    setTrainers((prev) => {
      const updated = prev.map((t) =>
        t.id === trainer.id ? { ...t, isFeatured: !t.isFeatured } : t
      );
      return [...updated.filter((t) => t.isFeatured), ...updated.filter((t) => !t.isFeatured)];
    });
    const msg = trainer.isFeatured
      ? `${trainer.name} 트레이너 상위 노출이 해제되었습니다.`
      : `${trainer.name} 트레이너가 상위에 노출됩니다.`;
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  /* 삭제 확인 */
  function handleDelete(trainer: TrainerWithState) {
    setPendingDelete(trainer);
  }

  /* 삭제 실행 */
  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteTrainer(pendingDelete.id);
    setTrainers((prev) => prev.filter((t) => t.id !== pendingDelete.id));
    const msg = `${pendingDelete.name} 트레이너가 삭제되었습니다.`;
    setPendingDelete(null);
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(14,14,14,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
              style={{ color: "#8eabff" }}
            >
              관리
            </p>
            <h1
              className="text-[20px] font-bold tracking-tight"
              style={{ color: "#ffffff" }}
            >
              트레이너 관리
            </h1>
          </div>

          {/* 등록 버튼 */}
          <Link
            href="/admin/trainers/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-opacity active:opacity-80"
            style={{ background: "linear-gradient(135deg, #8eabff 0%, #156aff 100%)", color: "#fff" }}
          >
            <PlusIcon />
            등록
          </Link>
        </div>

        {/* 탭 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count    = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium transition-all duration-150"
                style={{
                  background: isActive ? "#156aff" : "#1a1a1a",
                  color:      isActive ? "#fff"    : "#5a5a5a",
                  border:     `1.5px solid ${isActive ? "#156aff" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {tab.label}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#131313",
                    color:      isActive ? "#fff" : "#5a5a5a",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ── 목록 ── */}
      <main className="page-scroll px-4 pt-3">

        {/* 결과 수 + 노출 현황 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px]" style={{ color: "#3a3a3a" }}>
            {filtered.length}명
          </p>
          <p className="text-[11.5px]" style={{ color: "#3a3a3a" }}>
            노출 중 {counts.active} · 비활성 {counts.inactive}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onFeature={handleFeature}
              />
            ))}
            <p
              className="text-center text-[12px] py-4"
              style={{ color: "rgba(255,255,255,0.06)" }}
            >
              — 모두 확인했습니다 —
            </p>
          </div>
        ) : (
          <EmptyState tab={activeTab} />
        )}
      </main>

      {/* ── 노출 토글 모달 ── */}
      {pending && (
        <ConfirmSheet
          name={pending.name}
          isActive={pending.isActive}
          onConfirm={confirmToggle}
          onCancel={() => setPending(null)}
        />
      )}

      {/* ── 삭제 확인 모달 ── */}
      {pendingDelete && (
        <DeleteSheet
          name={pendingDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && <Toast message={toast} />}

      <AdminBottomNav />
    </div>
  );
}

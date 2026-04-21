"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getAllTrainers, deleteTrainer, toggleFeatured, toggleActive } from "@/app/data/trainers";
import type { Trainer } from "@/app/data/trainers";
import AdminBottomNav from "@/app/admin/components/AdminBottomNav";

/* ── 필터 타입 ── */
type FilterType = "all" | "exposed" | "inactive";
const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",      label: "전체" },
  { key: "exposed",  label: "노출 중" },
  { key: "inactive", label: "비활성" },
];

/* ── 로컬 상태용 타입 ── */
type TrainerWithState = Trainer & { isFeatured: boolean };

/* ── 아이콘 ── */
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21M8 6V4H16V6M19 6L18 20H6L5 6"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── 토글 스위치 (32×16) ── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="relative flex-shrink-0"
      style={{ width: 32, height: 16 }}
    >
      <div
        className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on ? "#2F6BFF" : "rgba(255,255,255,0.10)" }}
      />
      <div
        className="absolute rounded-full transition-all duration-200"
        style={{
          top: 2, width: 12, height: 12,
          left: on ? 18 : 2,
          background: on ? "#fff" : "rgba(255,255,255,0.40)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
      />
    </button>
  );
}

/* ── 아바타 ── */
function Avatar({ name, image, size = 64 }: { name: string; image?: string; size?: number }) {
  const colors = ["#1a3a6e","#1a5a34","#3a1a6e","#6e1a1a","#5a5a1a","#1a5a5a"];
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        className="object-cover flex-shrink-0"
        style={{ width: size, height: size, borderRadius: 4, filter: "grayscale(100%) brightness(0.88)" }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{
        width: size, height: size, borderRadius: 4,
        background: colors[name.charCodeAt(0) % colors.length],
        fontSize: size * 0.36,
        filter: "grayscale(30%)",
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* ── 활성/비활성 확인 시트 ── */
function ConfirmSheet({
  name, isActive, onConfirm, onCancel,
}: {
  name: string; isActive: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[480px] rounded-t-3xl p-6"
        style={{ background: "#1a1a1a", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom) + 72px)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#262626" }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "#fff" }}>
          {isActive ? `${name} 트레이너를 비활성화할까요?` : `${name} 트레이너를 노출 복원할까요?`}
        </h3>
        <p className="text-[13px] leading-relaxed mb-7" style={{ color: "#5a5a5a" }}>
          {isActive
            ? "비활성화하면 회원 리스트에서 숨겨집니다. 언제든지 다시 노출할 수 있습니다."
            : "노출 복원하면 회원 리스트에 다시 표시됩니다."}
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ background: "#131313", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
            취소
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold"
            style={{
              background: isActive ? "rgba(255,255,255,0.06)" : "#1a55d4",
              color: isActive ? "#a0a0a0" : "#fff",
            }}>
            {isActive ? "비활성화" : "노출 복원"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 삭제 확인 시트 ── */
function DeleteSheet({
  name, onConfirm, onCancel,
}: {
  name: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[480px] rounded-t-3xl p-6"
        style={{ background: "#1a1a1a", paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom) + 72px)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: "#262626" }} />
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "#fff" }}>{name} 트레이너를 삭제할까요?</h3>
        <p className="text-[13px] leading-relaxed mb-7" style={{ color: "#5a5a5a" }}>
          삭제하면 해당 트레이너 정보가 완전히 제거됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-medium"
            style={{ background: "#131313", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
            취소
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold"
            style={{ background: "#f87171", color: "#fff" }}>
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
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-lg pointer-events-none"
      style={{ background: "#34d399", color: "#fff", whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}

/* ── 페이지 ── */
export default function AdminTrainersPage() {
  const [filter, setFilter]         = useState<FilterType>("all");
  const [trainers, setTrainers]     = useState<TrainerWithState[]>([]);
  const [pending, setPending]       = useState<TrainerWithState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TrainerWithState | null>(null);
  const [toast, setToast]           = useState("");

  useEffect(() => {
    getAllTrainers().then((list) =>
      setTrainers(list.map((t: Trainer) => ({ ...t, isFeatured: t.featured ?? false })))
    );
  }, []);

  const filtered = useMemo(() => {
    if (filter === "exposed")  return trainers.filter((t) => t.isActive !== false);
    if (filter === "inactive") return trainers.filter((t) => t.isActive === false);
    return trainers;
  }, [trainers, filter]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  /* 활성 토글 */
  function handleToggle(t: TrainerWithState) { setPending(t); }
  async function confirmToggle() {
    if (!pending) return;
    const next = !(pending.isActive ?? true);
    setTrainers((prev) => prev.map((t) => t.id === pending.id ? { ...t, isActive: next } : t));
    await toggleActive(pending.id);
    showToast(`${pending.name} ${next ? "활성화" : "비활성화"}됨`);
    setPending(null);
  }

  /* 상위 노출 토글 */
  async function handleFeature(t: TrainerWithState) {
    const next = !t.isFeatured;
    await toggleFeatured(t.id);
    setTrainers((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, isFeatured: next } : tr));
    showToast(`${t.name} ${next ? "상위 노출 설정" : "상위 노출 해제"}`);
  }

  /* 삭제 */
  function handleDelete(t: TrainerWithState) { setPendingDelete(t); }
  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteTrainer(pendingDelete.id);
    setTrainers((prev) => prev.filter((t) => t.id !== pendingDelete.id));
    showToast(`${pendingDelete.name} 삭제됨`);
    setPendingDelete(null);
  }

  return (
    <div className="min-h-dvh" style={{ background: "#131313" }}>

      {/* ── 헤더 ── */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-5"
        style={{ background: "rgba(19,19,19,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#ffffff" }}>
          Trainers
        </h1>
        <Link
          href="/admin/trainers/new"
          className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #2F6BFF 0%, #1A4BCC 100%)",
            color: "#fff",
            borderRadius: 6,
          }}
        >
          <PlusIcon />
          Add Trainer
        </Link>
      </header>

      <main className="pt-24 pb-32 px-5">

        {/* ── 필터 칩 ── */}
        <div className="flex gap-3 mb-6 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-5 py-2 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-colors"
              style={{
                borderRadius: 12,
                background: filter === f.key ? "#2F6BFF" : "#2a2a2a",
                color:       filter === f.key ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── 카드 목록 ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl"
            style={{ background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[13px]" style={{ color: "#3a3a3a" }}>
              {trainers.length === 0 ? "등록된 트레이너가 없습니다." : "해당 트레이너가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((t) => (
              <article
                key={t.id}
                className="pt-5 px-5"
                style={{
                  background: "#1c1b1b",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)",
                  opacity: t.isActive === false ? 0.65 : 1,
                  overflow: "hidden",
                }}
              >
                {/* 상단: 사진 + 정보 + 토글 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <Avatar name={t.name} image={t.profileImage || undefined} size={64} />
                    <div>
                      {/* 이름 + 뱃지 */}
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-[17px] font-bold leading-none" style={{ color: "#fff" }}>
                          {t.name}
                        </h2>
                        {t.isActive !== false ? (
                          <span
                            className="text-[10px] font-black uppercase tracking-tight px-1.5 py-0.5"
                            style={{ borderRadius: 3, background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}
                          >
                            노출 중
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-black uppercase tracking-tight px-1.5 py-0.5"
                            style={{ borderRadius: 3, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
                          >
                            비활성
                          </span>
                        )}
                      </div>
                      {/* 전문 분야 */}
                      <p className="text-[12px] font-medium mb-2" style={{ color: "rgba(255,255,255,0.40)" }}>
                        {t.specialty}
                      </p>
                      {/* 별점 + 경력 */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <svg width="13" height="13" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                              fill="#2F6BFF" />
                          </svg>
                          <span className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.80)" }}>
                            {t.ratingAvg > 0 ? t.ratingAvg.toFixed(1) : "—"}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-widest"
                          style={{ color: "rgba(255,255,255,0.20)" }}>
                          {t.careerYears} Years Exp.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 토글 + 상위노출 (제어) */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[9px] font-bold whitespace-nowrap"
                      style={{ color: t.isFeatured ? "#c9a96e" : "rgba(255,255,255,0.18)" }}
                    >
                      상위노출
                    </span>
                    <Toggle on={t.isFeatured} onChange={() => handleFeature(t)} />
                  </div>
                </div>

                {/* 태그 */}
                {t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-[10px] font-bold"
                        style={{ borderRadius: 3, background: "#353534", color: "rgba(255,255,255,0.55)" }}
                      >
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* 액션 바 */}
                <div
                  className="flex mt-4 -mx-5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {/* 수정 */}
                  <Link
                    href={`/admin/trainers/${t.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
                    style={{ color: "#a0a0a0" }}
                  >
                    <EditIcon />
                    수정
                  </Link>

                  <div className="w-px" style={{ background: "rgba(255,255,255,0.04)" }} />

                  {/* 비활성화 / 노출 복원 */}
                  <button
                    onClick={() => handleToggle(t)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
                    style={{ color: t.isActive !== false ? "#5a5a5a" : "#34d399" }}
                  >
                    {t.isActive !== false ? <><EyeOffIcon />비활성화</> : <><EyeIcon />노출 복원</>}
                  </button>

                  <div className="w-px" style={{ background: "rgba(255,255,255,0.04)" }} />

                  {/* 삭제 */}
                  <button
                    onClick={() => handleDelete(t)}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-medium transition-opacity active:opacity-70"
                    style={{ color: "#f87171" }}
                  >
                    <TrashIcon />
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 활성 토글 확인 */}
      {pending && (
        <ConfirmSheet
          name={pending.name}
          isActive={pending.isActive !== false}
          onConfirm={confirmToggle}
          onCancel={() => setPending(null)}
        />
      )}

      {/* 삭제 확인 */}
      {pendingDelete && (
        <DeleteSheet
          name={pendingDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {toast && <Toast message={toast} />}
      <AdminBottomNav />
    </div>
  );
}

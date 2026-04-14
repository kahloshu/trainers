"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAllTrainers,
  deleteTrainer,
  toggleFeatured,
  toggleActive,
  updateDisplayOrders,
  type Trainer,
} from "@/app/data/trainers";

/* ── 아이콘 ── */
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function DragIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9"  cy="6"  r="1.5" fill="currentColor" />
      <circle cx="15" cy="6"  r="1.5" fill="currentColor" />
      <circle cx="9"  cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9"  cy="18" r="1.5" fill="currentColor" />
      <circle cx="15" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21M8 6V4H16V6M19 6L18 20H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "#c9a96e" : "none"} stroke="#c9a96e" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 토글 스위치 ── */
function Toggle({ on, onChange, color = "#34d399" }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="relative flex-shrink-0 transition-all"
      style={{ width: 36, height: 20 }}
    >
      <div
        className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on ? color : "rgba(255,255,255,0.08)" }}
      />
      <div
        className="absolute top-1 rounded-full transition-all duration-200"
        style={{
          width: 12, height: 12,
          left: on ? 21 : 3,
          background: on ? "#fff" : "#3a3a3a",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}

/* ── 이니셜 아바타 ── */
function Avatar({ name, image, size = 36 }: { name: string; image?: string; size?: number }) {
  const colors = ["#1a4a8a","#1a6a3a","#4a1a8a","#8a1a1a","#6a6a1a","#1a6a6a"];
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={name} className="rounded-lg object-cover flex-shrink-0"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div
      className="rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: colors[name.charCodeAt(0) % colors.length], fontSize: size * 0.38 }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* ── 삭제 확인 모달 ── */
function DeleteModal({
  name, loading, onConfirm, onCancel,
}: {
  name: string; loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[380px] rounded-2xl p-6 mx-4"
        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h3 className="text-[16px] font-bold mb-1.5" style={{ color: "#ffffff" }}>트레이너 삭제</h3>
        <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#5a5a5a" }}>
          <span style={{ color: "#ffffff" }}>{name}</span> 트레이너를 삭제하시겠습니까?<br />
          삭제 후에는 복구할 수 없습니다.
        </p>
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

/* ── 페이지 ── */
export default function DashboardTrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]       = useState("");
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder]   = useState(false);

  /* 드래그 상태 */
  const dragIndex = useRef<number | null>(null);
  const dragOver  = useRef<number | null>(null);

  useEffect(() => {
    getAllTrainers().then((list) => { setTrainers(list); setLoading(false); });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  /* ── 활성 토글 ── */
  async function handleToggleActive(t: Trainer) {
    const next = !(t.isActive ?? true);
    setTrainers((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, isActive: next } : tr));
    await toggleActive(t.id);
    showToast(`${t.name} 트레이너 ${next ? "활성화" : "비활성화"}됨`);
  }

  /* ── 상위 노출 토글 ── */
  async function handleToggleFeatured(t: Trainer) {
    const next = !(t.featured ?? false);
    setTrainers((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, featured: next } : tr));
    await toggleFeatured(t.id);
    showToast(`${t.name} ${next ? "상위 노출 설정" : "상위 노출 해제"}`);
  }

  /* ── 삭제 ── */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteTrainer(deleteTarget.id);
    setTrainers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteLoading(false);
    setDeleteTarget(null);
    showToast("삭제되었습니다.");
  }

  /* ── 드래그 & 드롭 ── */
  function onDragStart(i: number) { dragIndex.current = i; }
  function onDragEnter(i: number) { dragOver.current  = i; }
  function onDragEnd() {
    if (dragIndex.current === null || dragOver.current === null) return;
    if (dragIndex.current === dragOver.current) { dragIndex.current = dragOver.current = null; return; }
    const next = [...trainers];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dragOver.current, 0, moved);
    dragIndex.current = dragOver.current = null;
    setTrainers(next);
    setOrderChanged(true);
  }

  /* ── 순서 저장 ── */
  async function saveOrder() {
    setSavingOrder(true);
    await updateDisplayOrders(trainers.map((t, i) => ({ id: t.id, displayOrder: i })));
    setSavingOrder(false);
    setOrderChanged(false);
    showToast("노출 순서가 저장되었습니다.");
  }

  /* ── 카운트 ── */
  const activeCount   = trainers.filter((t) => t.isActive !== false).length;
  const featuredCount = trainers.filter((t) => t.featured).length;

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[20px] font-bold" style={{ color: "#ffffff" }}>트레이너 관리</h2>
          <p className="text-[13px] mt-0.5" style={{ color: "#3a3a3a" }}>
            전체 {trainers.length}명 · 활성 {activeCount}명 · 상위 노출 {featuredCount}명
          </p>
        </div>
        <div className="flex items-center gap-2">
          {orderChanged && (
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
              style={{ background: "rgba(142,171,255,0.15)", color: "#8eabff", border: "1px solid rgba(142,171,255,0.25)" }}
            >
              {savingOrder ? "저장 중…" : "순서 저장"}
            </button>
          )}
          <button
            onClick={() => router.push("/dashboard/trainers/new")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ background: "linear-gradient(135deg,#8eabff,#156aff)", color: "#000" }}
          >
            <PlusIcon />
            새 트레이너
          </button>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <span className="text-[11.5px]" style={{ color: "#3a3a3a" }}>
          ⠿ 드래그하여 순서 조정 · 순서 변경 후 <span style={{ color: "#8eabff" }}>순서 저장</span> 버튼 클릭
        </span>
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
        {/* 컬럼 헤더 */}
        <div className="grid items-center px-4 py-2.5"
          style={{
            gridTemplateColumns: "32px 40px 1fr 100px 90px 80px 80px 120px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
          {["", "", "트레이너", "전문 분야", "지점", "활성", "상위 노출", ""].map((h, i) => (
            <span key={i} className="text-[11px] font-semibold tracking-[0.1em] uppercase" style={{ color: "#3a3a3a" }}>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="p-6 flex flex-col gap-2.5 animate-pulse">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-14 rounded-xl" style={{ background: "#1a1a1a" }} />
            ))}
          </div>
        ) : trainers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px]" style={{ color: "#3a3a3a" }}>등록된 트레이너가 없습니다.</p>
          </div>
        ) : (
          trainers.map((t, i) => (
            <div
              key={t.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="grid items-center px-4 py-3 transition-colors select-none"
              style={{
                gridTemplateColumns: "32px 40px 1fr 100px 90px 80px 80px 120px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                opacity: t.isActive === false ? 0.45 : 1,
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              {/* 드래그 핸들 */}
              <span className="cursor-grab active:cursor-grabbing" style={{ color: "#2a2a2a" }}>
                <DragIcon />
              </span>

              {/* 순서 번호 */}
              <span className="text-[12px] font-mono" style={{ color: "#2a2a2a" }}>{i + 1}</span>

              {/* 이름 + 이미지 */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={t.name} image={t.profileImage || undefined} size={34} />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold truncate" style={{ color: "#ffffff" }}>{t.name}</p>
                  <p className="text-[11.5px] truncate" style={{ color: "#3a3a3a" }}>{t.careerYears}년차</p>
                </div>
              </div>

              {/* 전문 분야 */}
              <span className="text-[12.5px] truncate" style={{ color: "#a0a0a0" }}>{t.specialty}</span>

              {/* 지점 */}
              <span className="text-[12px] truncate" style={{ color: t.branch ? "#5a5a5a" : "#2a2a2a" }}>
                {t.branch || "—"}
              </span>

              {/* 활성 토글 */}
              <div>
                <Toggle on={t.isActive !== false} onChange={() => handleToggleActive(t)} />
              </div>

              {/* 상위 노출 토글 */}
              <div className="flex items-center gap-1.5">
                <Toggle
                  on={t.featured ?? false}
                  onChange={() => handleToggleFeatured(t)}
                  color="#c9a96e"
                />
                {t.featured && <StarIcon filled />}
              </div>

              {/* 액션 */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => router.push(`/dashboard/trainers/${t.id}`)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                  style={{ background: "#1a1a1a", color: "#8eabff", border: "1px solid rgba(142,171,255,0.15)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(142,171,255,0.10)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1a1a1a")}
                >
                  <EditIcon />
                  수정
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                  style={{ background: "#1a1a1a", color: "#3a3a3a", border: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.10)";
                    (e.currentTarget as HTMLElement).style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
                    (e.currentTarget as HTMLElement).style.color = "#3a3a3a";
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 삭제 모달 */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
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

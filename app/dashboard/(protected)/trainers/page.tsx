"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21M8 6V4H16V6M19 6L18 20H6L5 6"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d={dir === "left" ? "M15 18L9 12L15 6" : "M9 18L15 12L9 6"}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DragIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="9"  cy="6"  r="1.3" fill="currentColor" />
      <circle cx="15" cy="6"  r="1.3" fill="currentColor" />
      <circle cx="9"  cy="12" r="1.3" fill="currentColor" />
      <circle cx="15" cy="12" r="1.3" fill="currentColor" />
      <circle cx="9"  cy="18" r="1.3" fill="currentColor" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" />
    </svg>
  );
}

/* ── 토글 ── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className="relative flex-shrink-0"
      style={{ width: 38, height: 20 }}
    >
      <div className="absolute inset-0 rounded-full transition-all duration-200"
        style={{ background: on ? "#2F6BFF" : "var(--dash-toggle-off)" }} />
      <div className="absolute top-[3px] rounded-full transition-all duration-200"
        style={{
          width: 14, height: 14,
          left: on ? 21 : 3,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }} />
    </button>
  );
}

/* ── 아바타 ── */
function Avatar({ name, image }: { name: string; image?: string }) {
  const colors = ["#1a3a6e","#1a5a34","#3a1a6e","#6e1a1a","#5a5a1a","#1a5a5a"];
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt={name}
        className="object-cover flex-shrink-0"
        style={{ width: 34, height: 34, borderRadius: 6, filter: "grayscale(80%) brightness(0.85)" }} />
    );
  }
  return (
    <div className="flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{
        width: 34, height: 34, borderRadius: 6,
        background: colors[name.charCodeAt(0) % colors.length],
        fontSize: 13,
      }}>
      {name.charAt(0)}
    </div>
  );
}

/* ── 삭제 모달 ── */
function DeleteModal({ name, loading, onConfirm, onCancel }: {
  name: string; loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[380px] mx-4 p-6 rounded-2xl"
        style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-modal-border)" }}>
        <h3 className="text-[16px] font-bold mb-1.5" style={{ color: "var(--dash-text)" }}>트레이너 삭제</h3>
        <p className="text-[13px] leading-relaxed mb-6" style={{ color: "var(--dash-text-muted)" }}>
          <span style={{ color: "var(--dash-text)" }}>{name}</span> 트레이너를 삭제하시겠습니까?<br />
          삭제 후에는 복구할 수 없습니다.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-[13.5px] font-medium"
            style={{ background: "var(--dash-card)", color: "var(--dash-text-sub)", border: "1px solid var(--dash-hover-btn)" }}>
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

/* ── 통계 카드 ── */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="dash-card-el flex-1 px-5 py-4 rounded-xl"
      style={{ background: "var(--dash-card)", minWidth: 0 }}>
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
        style={{ color: "var(--dash-text-dimmed)" }}>{label}</p>
      <p className="text-[28px] font-bold leading-none" style={{ color: "var(--dash-text)" }}>{value}</p>
    </div>
  );
}

const PAGE_SIZE = 8;

/* ── 페이지 ── */
export default function DashboardTrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers]     = useState<Trainer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]           = useState("");
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder]   = useState(false);

  const dragIndex = useRef<number | null>(null);
  const dragOver  = useRef<number | null>(null);

  useEffect(() => {
    getAllTrainers().then((list) => { setTrainers(list); setLoading(false); });
  }, []);

  function showToast(msg: string) {
    setToast(msg); setTimeout(() => setToast(""), 2200);
  }

  async function handleToggleActive(t: Trainer) {
    const next = !(t.isActive ?? true);
    setTrainers((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, isActive: next } : tr));
    await toggleActive(t.id);
    showToast(`${t.name} ${next ? "활성화" : "비활성화"}됨`);
  }

  async function handleToggleFeatured(t: Trainer) {
    const next = !(t.featured ?? false);
    setTrainers((prev) => prev.map((tr) => tr.id === t.id ? { ...tr, featured: next } : tr));
    await toggleFeatured(t.id);
    showToast(`${t.name} ${next ? "상위 노출 설정" : "상위 노출 해제"}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await deleteTrainer(deleteTarget.id);
    setTrainers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    setDeleteLoading(false); setDeleteTarget(null);
    showToast("삭제되었습니다.");
  }

  function onDragStart(i: number) { dragIndex.current = i; }
  function onDragEnter(i: number) { dragOver.current  = i; }
  function onDragEnd() {
    if (dragIndex.current === null || dragOver.current === null) return;
    if (dragIndex.current === dragOver.current) { dragIndex.current = dragOver.current = null; return; }
    const next = [...trainers];
    const [moved] = next.splice(dragIndex.current, 1);
    next.splice(dragOver.current, 0, moved);
    dragIndex.current = dragOver.current = null;
    setTrainers(next); setOrderChanged(true);
  }

  async function saveOrder() {
    setSavingOrder(true);
    await updateDisplayOrders(trainers.map((t, i) => ({ id: t.id, displayOrder: i })));
    setSavingOrder(false); setOrderChanged(false);
    showToast("순서 저장 완료");
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trainers;
    return trainers.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      (t.specialty ?? "").toLowerCase().includes(q) ||
      (t.branch ?? "").toLowerCase().includes(q)
    );
  }, [trainers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /* 통계 */
  const stats = useMemo(() => ({
    total:    trainers.length,
    active:   trainers.filter((t) => t.isActive !== false).length,
    featured: trainers.filter((t) => t.featured).length,
    inactive: trainers.filter((t) => t.isActive === false).length,
  }), [trainers]);

  /* 페이지 번호 목록 (최대 5개) */
  function pageNumbers() {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  return (
    <div className="p-4 md:p-8">

      {/* ── 헤더 ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-[28px] font-black tracking-tight uppercase mb-1.5"
            style={{ color: "var(--dash-text)" }}>
            트레이너 관리
          </h2>
          <p className="text-[13px] max-w-[420px] leading-relaxed"
            style={{ color: "var(--dash-text-sub)" }}>
            트레이너 목록을 관리하세요. 노출 여부와 상위 노출 상태를 여기서 바로 설정할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {orderChanged && (
            <button onClick={saveOrder} disabled={savingOrder}
              className="px-4 py-2.5 rounded-lg text-[12.5px] font-semibold disabled:opacity-50"
              style={{ background: "rgba(47,107,255,0.15)", color: "#2F6BFF" }}>
              {savingOrder ? "저장 중…" : "순서 저장"}
            </button>
          )}
          <button onClick={() => router.push("/dashboard/trainers/new")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold"
            style={{ background: "linear-gradient(135deg,#2F6BFF,#1a55d4)", color: "#fff" }}>
            <PlusIcon /> 트레이너 추가
          </button>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
      <div className="grid grid-cols-2 md:flex gap-4 mb-8">
        <StatCard label="전체 트레이너" value={stats.total} />
        <StatCard label="활성 트레이너" value={stats.active} />
        <StatCard label="상위 노출"    value={stats.featured} />
        <StatCard label="비활성"        value={stats.inactive} />
      </div>

      {/* ── 검색 ── */}
      <div className="mb-4">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="트레이너 이름 / 전문 분야 / 지점 검색"
          className="dash-input w-full max-w-[360px] px-4 py-2.5 text-[13px]" />
      </div>

      {/* ── 테이블 ── */}
      <div className="dash-card-el rounded-2xl overflow-hidden"
        style={{ background: "var(--dash-card)" }}>

        {/* 컬럼 헤더 */}
        <div className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "28px 1fr 1.4fr 110px 120px 90px",
            borderBottom: "1px solid var(--dash-border)",
          }}>
          {["", "트레이너 정보", "전문 분야", "상태", "상위 노출", "관리"].map((h, i) => (
            <span key={i} className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: "var(--dash-text-dimmed)" }}>
              {h}
            </span>
          ))}
        </div>

        {/* 로딩 */}
        {loading ? (
          <div className="p-6 flex flex-col gap-2.5 animate-pulse">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-12 rounded-xl" style={{ background: "var(--dash-surface)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px]" style={{ color: "var(--dash-text-dimmed)" }}>
              {trainers.length === 0 ? "등록된 트레이너가 없습니다." : "검색 결과가 없습니다."}
            </p>
          </div>
        ) : (
          paginated.map((t, i) => (
            <div key={t.id}
              draggable
              onDragStart={() => onDragStart((currentPage - 1) * PAGE_SIZE + i)}
              onDragEnter={() => onDragEnter((currentPage - 1) * PAGE_SIZE + i)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="grid items-center px-5 py-3 select-none transition-colors"
              style={{
                gridTemplateColumns: "28px 1fr 1.4fr 110px 120px 90px",
                borderBottom: "1px solid var(--dash-border-xs)",
                opacity: t.isActive === false ? 0.45 : 1,
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--dash-hover-row)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              {/* 드래그 */}
              <span className="cursor-grab active:cursor-grabbing" style={{ color: "var(--dash-text-faint)" }}>
                <DragIcon />
              </span>

              {/* 트레이너 정보 */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={t.name} image={t.profileImage || undefined} />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold truncate" style={{ color: "var(--dash-text)" }}>
                    {t.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--dash-text-dimmed)" }}>
                    경력 {t.careerYears}년차{t.branch ? ` · ${t.branch}` : ""}
                  </p>
                </div>
              </div>

              {/* 전문 분야 */}
              <div className="flex flex-wrap gap-1">
                {(t.specialty ?? "").split(/[·,\/]/).map((s) => s.trim()).filter(Boolean).length > 0
                  ? (t.specialty ?? "").split(/[·,\/]/).map((s) => s.trim()).filter(Boolean).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[11px] font-semibold"
                        style={{
                          borderRadius: 4,
                          background: "var(--dash-surface-2)",
                          color: "var(--dash-text-sub)",
                          border: "1px solid var(--dash-border)",
                          whiteSpace: "nowrap",
                        }}>
                        {s}
                      </span>
                    ))
                  : <span style={{ color: "var(--dash-text-faint)" }}>—</span>
                }
              </div>

              {/* STATUS 토글 */}
              <div className="flex items-center gap-2">
                <Toggle on={t.isActive !== false} onChange={() => handleToggleActive(t)} />
              </div>

              {/* TOP EXPOSURE 토글 */}
              <div className="flex items-center gap-2">
                <Toggle on={t.featured ?? false} onChange={() => handleToggleFeatured(t)} />
              </div>

              {/* 액션 */}
              <div className="flex items-center gap-2">
                <button onClick={() => router.push(`/dashboard/trainers/${t.id}`)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                  style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(47,107,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "#2F6BFF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--dash-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)"; }}>
                  <EditIcon />
                </button>
                <button onClick={() => setDeleteTarget(t)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                  style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.10)"; (e.currentTarget as HTMLElement).style.color = "#f87171"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--dash-surface)"; (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)"; }}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}

        {/* ── 페이지네이션 ── */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ borderTop: "1px solid var(--dash-border)" }}>
            <p className="text-[11.5px]" style={{ color: "var(--dash-text-dimmed)" }}>
              {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} / 전체 {filtered.length}명
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}>
                <ChevronIcon dir="left" />
              </button>
              {pageNumbers().map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold transition-all"
                  style={{
                    background: n === currentPage ? "#2F6BFF" : "var(--dash-surface)",
                    color:      n === currentPage ? "#fff" : "var(--dash-text-muted)",
                  }}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}>
                <ChevronIcon dir="right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name} loading={deleteLoading}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

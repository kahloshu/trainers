"use client";

import { useState, useEffect } from "react";
import { getCategories, addCategory, deleteCategory, type Category } from "@/app/data/categories";
import Toast from "../components/Toast";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [idInput, setIdInput]       = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [adding, setAdding]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    getCategories().then((cats) => { setCategories(cats); setLoading(false); });
  }, []);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  }

  async function handleAdd() {
    const id    = idInput.trim();
    const label = labelInput.trim() || id;
    if (!id) return;
    if (categories.some((c) => c.id === id)) {
      showToast("이미 존재하는 카테고리입니다.", "error"); return;
    }
    setAdding(true);
    const ok = await addCategory(id, label);
    if (ok) {
      const updated = await getCategories();
      setCategories(updated);
      setIdInput(""); setLabelInput("");
      showToast(`"${label}" 카테고리가 추가되었습니다.`);
    } else {
      showToast("추가에 실패했습니다.", "error");
    }
    setAdding(false);
  }

  async function handleDelete(cat: Category) {
    await deleteCategory(cat.id);
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setDeleteTarget(null);
    showToast(`"${cat.label}" 카테고리가 삭제되었습니다.`);
  }

  return (
    <div className="p-4 md:p-8 max-w-[640px]">

      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-[28px] font-black tracking-tight uppercase mb-1.5"
          style={{ color: "var(--dash-text)" }}>설정</h2>
        <p className="text-[13px]" style={{ color: "var(--dash-text-sub)" }}>
          카테고리 등 앱 전반의 설정을 관리합니다.
        </p>
      </div>

      {/* 카테고리 관리 */}
      <div className="dash-card-el rounded-2xl overflow-hidden"
        style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--dash-border)" }}>
          <p className="text-[14px] font-semibold" style={{ color: "var(--dash-text)" }}>전문 분야 카테고리</p>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--dash-text-dimmed)" }}>
            트레이너 추가/수정 및 메인 필터에 사용됩니다.
          </p>
        </div>

        <div className="p-5">
          {/* 카테고리 목록 */}
          {loading ? (
            <div className="flex flex-col gap-2 animate-pulse mb-5">
              {[1,2,3].map((i) => <div key={i} className="h-10 rounded-xl" style={{ background: "var(--dash-surface)" }} />)}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-[13px] mb-5 py-4 text-center" style={{ color: "var(--dash-text-dimmed)" }}>
              카테고리가 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2 mb-5">
              {categories.map((cat) => (
                <div key={cat.id}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                  style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-sm)" }}>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                      style={{ background: "rgba(47,107,255,0.10)", color: "#2F6BFF" }}>
                      {cat.label}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--dash-text-dimmed)" }}>
                      id: {cat.id}
                    </span>
                  </div>
                  {deleteTarget?.id === cat.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px]" style={{ color: "var(--dash-text-dimmed)" }}>삭제할까요?</span>
                      <button onClick={() => handleDelete(cat)}
                        className="px-2.5 py-1 rounded-lg text-[12px] font-semibold"
                        style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}>확인</button>
                      <button onClick={() => setDeleteTarget(null)}
                        className="px-2.5 py-1 rounded-lg text-[12px]"
                        style={{ color: "var(--dash-text-dimmed)" }}>취소</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteTarget(cat)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--dash-text-faint)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--dash-text-faint)")}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 추가 폼 */}
          <div className="flex flex-col gap-2.5 pt-4" style={{ borderTop: "1px solid var(--dash-border-sm)" }}>
            <p className="text-[12px] font-semibold" style={{ color: "var(--dash-text-sub)" }}>새 카테고리 추가</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="카테고리명 (예: 근력 향상)"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={{ background: "var(--dash-input-bg)", border: "1.5px solid var(--dash-input-border)", color: "var(--dash-text)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--dash-input-border)")}
                />
              </div>
              <div className="flex-1">
                <input
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="표시명 (예: 근력) — 비우면 카테고리명 사용"
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={{ background: "var(--dash-input-bg)", border: "1.5px solid var(--dash-input-border)", color: "var(--dash-text)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--dash-input-border)")}
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={adding || !idInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity disabled:opacity-40 flex-shrink-0"
                style={{ background: "rgba(47,107,255,0.15)", color: "#2F6BFF" }}
              >
                <PlusIcon />
                추가
              </button>
            </div>
            <p className="text-[11.5px]" style={{ color: "var(--dash-text-faint)" }}>
              카테고리명은 트레이너 태그와 정확히 일치해야 필터링됩니다.
            </p>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}

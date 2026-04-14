"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  getApplicationById,
  updateApplicationStatus,
  updateApplicationNote,
  updateApplicationTrainer,
  STATUS_LABEL,
  DAY_LABEL,
  TIME_LABEL,
  timeAgoLabel,
  type Application,
  type AppStatus,
} from "@/app/data/applications";
import { getAllTrainers, type Trainer } from "@/app/data/trainers";

/* ── 상태 스타일 ── */
const STATUS_STYLE: Record<AppStatus, { text: string; bg: string; border: string }> = {
  pending:   { text: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.2)" },
  confirmed: { text: "#fbbf24", bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.2)"   },
  completed: { text: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.2)"  },
  cancelled: { text: "#5a5a5a", bg: "rgba(90,90,90,0.10)",    border: "rgba(90,90,90,0.2)"    },
};

const NEXT_STATUS: Partial<Record<AppStatus, { status: AppStatus; label: string; color: string }>> = {
  pending:   { status: "confirmed", label: "확정 처리",  color: "#34d399" },
  confirmed: { status: "completed", label: "완료 처리",  color: "#8eabff" },
};

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ── 날짜 포맷 ── */
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

/* ── 섹션 카드 ── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── 정보 행 ── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
      <span className="text-[12.5px] flex-shrink-0" style={{ color: "#5a5a5a" }}>{label}</span>
      <span className="text-[13px] font-medium text-right leading-snug" style={{ color: "#d0d0d0" }}>{value}</span>
    </div>
  );
}

/* ── 확인 모달 ── */
function ConfirmModal({
  title, desc, confirmLabel, confirmColor, loading,
  onConfirm, onCancel,
}: {
  title: string; desc: string; confirmLabel: string; confirmColor: string;
  loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-[400px] rounded-2xl p-6 mx-4" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "#ffffff" }}>{title}</h3>
        <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#5a5a5a" }}>{desc}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-[13.5px] font-medium"
            style={{ background: "#141414", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.06)" }}>
            취소
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 rounded-xl text-[13.5px] font-semibold transition-opacity disabled:opacity-50"
            style={{ background: confirmColor, color: "#fff" }}>
            {loading ? "처리 중…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 토스트 ── */
function Toast({ message, type = "success" }: { message: string; type?: "success" | "error" }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-[13px] font-semibold shadow-xl flex items-center gap-2"
      style={{ background: type === "success" ? "#34d399" : "#f87171", color: "#fff" }}>
      {type === "success" ? <CheckIcon /> : <AlertIcon />}
      {message}
    </div>
  );
}

/* ── 로딩 스켈레톤 ── */
function Skeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 w-48 rounded-xl mb-6" style={{ background: "#1a1a1a" }} />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="h-40 rounded-2xl" style={{ background: "#141414" }} />
        ))}
      </div>
    </div>
  );
}

/* ── 페이지 ── */
export default function DashboardAppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [app, setApp]             = useState<Application | null | "loading">("loading");
  const [trainers, setTrainers]   = useState<Trainer[]>([]);
  const [note, setNote]           = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [modal, setModal]         = useState<null | "confirm" | "complete" | "cancel">(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* 트레이너 배정용 */
  const [trainerEdit, setTrainerEdit]       = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [trainerSaving, setTrainerSaving]   = useState(false);

  useEffect(() => {
    getApplicationById(id).then((found) => {
      if (!found) { setApp(null); return; }
      setApp(found);
      setNote(found.adminNote);
      setSelectedTrainerId(found.trainerId);
    });
    getAllTrainers().then(setTrainers);
  }, [id]);

  if (app === "loading") return <Skeleton />;
  if (!app) return notFound();

  const days  = app.preferredDays.map((d) => DAY_LABEL[d]  ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");
  const next  = NEXT_STATUS[app.status];
  const sc    = STATUS_STYLE[app.status];

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  /* ── 메모 저장 ── */
  async function saveNote() {
    await updateApplicationNote(id, note);
    setApp((prev) => prev && prev !== "loading" ? { ...prev, adminNote: note } : prev);
    setNoteSaved(true);
    showToast("메모가 저장되었습니다.");
    setTimeout(() => setNoteSaved(false), 2000);
  }

  /* ── 상태 변경 ── */
  async function changeStatus(newStatus: AppStatus) {
    setActionLoading(true);
    await updateApplicationStatus(id, newStatus);
    setApp((prev) => prev && prev !== "loading" ? { ...prev, status: newStatus } : prev);
    setModal(null);
    setActionLoading(false);
    const msgs: Record<AppStatus, string> = {
      confirmed: "확정 처리되었습니다.",
      completed: "완료 처리되었습니다.",
      cancelled: "취소 처리되었습니다.",
      pending: "",
    };
    showToast(msgs[newStatus]);
  }

  /* ── 트레이너 배정 ── */
  async function saveTrainer() {
    if (!app || app === "loading") return;
    const t = trainers.find((tr) => tr.id === selectedTrainerId);
    if (!t || (t.id === app.trainerId)) { setTrainerEdit(false); return; }
    setTrainerSaving(true);
    await updateApplicationTrainer(id, t.id, t.name);
    setApp((prev) => prev && prev !== "loading" ? { ...prev, trainerId: t.id, trainerName: t.name } : prev);
    setTrainerSaving(false);
    setTrainerEdit(false);
    showToast(`${t.name} 트레이너로 변경되었습니다.`);
  }

  /* ── 모달 설정 ── */
  const MODAL_CONFIG = {
    confirm: {
      title: "이 신청을 확정하시겠습니까?",
      desc:  "확정 후 회원에게 연락하여 일정을 조율해 주세요.",
      confirmLabel: "확정 처리",
      confirmColor: "#34d399",
      onConfirm: () => changeStatus("confirmed"),
    },
    complete: {
      title: "OT를 완료 처리하시겠습니까?",
      desc:  "완료 처리 후에는 되돌리기 어렵습니다. 실제 진행이 완료된 경우에만 처리하세요.",
      confirmLabel: "완료 처리",
      confirmColor: "#8eabff",
      onConfirm: () => changeStatus("completed"),
    },
    cancel: {
      title: "이 신청을 취소하시겠습니까?",
      desc:  "취소 후에는 되돌릴 수 없습니다.",
      confirmLabel: "취소 처리",
      confirmColor: "#f87171",
      onConfirm: () => changeStatus("cancelled"),
    },
  };

  return (
    <div className="p-6 max-w-[1100px]">

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard/applications")}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ background: "#1a1a1a", color: "#a0a0a0", border: "1px solid rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ffffff")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#a0a0a0")}
        >
          <BackIcon />
        </button>
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: "#ffffff" }}>신청 상세</h2>
          <p className="text-[12px]" style={{ color: "#3a3a3a" }}>#{id.slice(-8).toUpperCase()}</p>
        </div>
        {/* 상태 뱃지 */}
        <span
          className="ml-auto px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold"
          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
        >
          {STATUS_LABEL[app.status]}
        </span>
      </div>

      {/* 콘텐츠 그리드: 왼쪽(2열) + 오른쪽(1열) */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>

        {/* ── 왼쪽 ── */}
        <div className="flex flex-col gap-4">

          {/* 신청자 정보 */}
          <Card title="신청자 정보">
            <InfoRow label="이름" value={app.applicantName} />
            <InfoRow label="연락처" value={
              <a href={`tel:${app.applicantPhone.replace(/-/g,"")}`}
                className="font-semibold" style={{ color: "#8eabff" }}>
                {app.applicantPhone}
              </a>
            } />
            <InfoRow label="신청일시" value={fmtDate(app.createdAt)} />
            <div className="pt-1.5">
              <p className="text-[12px]" style={{ color: "#3a3a3a" }}>
                {timeAgoLabel(app.createdMinutesAgo)} 신청
              </p>
            </div>
          </Card>

          {/* 희망 일정 */}
          <Card title="희망 일정">
            <InfoRow label="희망 요일"   value={days  || "—"} />
            <InfoRow label="희망 시간대" value={times || "—"} />
          </Card>

          {/* 운동 목적 */}
          {app.purposes.length > 0 && (
            <Card title="운동 목적">
              <div className="flex flex-wrap gap-2 pt-1">
                {app.purposes.map((p) => (
                  <span key={p} className="px-3 py-1.5 rounded-full text-[12.5px] font-medium"
                    style={{ background: "rgba(142,171,255,0.08)", color: "#8eabff" }}>
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* 회원 요청사항 */}
          {app.userMessage && (
            <Card title="회원 요청사항">
              <p className="text-[13.5px] leading-relaxed italic" style={{ color: "#a0a0a0" }}>
                &ldquo;{app.userMessage}&rdquo;
              </p>
            </Card>
          )}

          {/* 관리자 메모 */}
          <Card title="관리자 메모 (비공개)">
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value.slice(0, 500)); setNoteSaved(false); }}
              placeholder="트레이너 연락 여부, 일정 조율 내용 등을 기록해 두세요."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-[13px] outline-none resize-none leading-relaxed transition-all"
              style={{ background: "#0e0e0e", border: "1.5px solid rgba(255,255,255,0.06)", color: "#ffffff" }}
              onFocus={(e) => (e.target.style.borderColor = "#8eabff")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px]" style={{ color: "#2a2a2a" }}>{note.length} / 500</span>
              <button
                onClick={saveNote}
                disabled={note === app.adminNote}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30"
                style={{
                  background: note !== app.adminNote ? "rgba(142,171,255,0.12)" : "#141414",
                  color:      note !== app.adminNote ? "#8eabff" : "#3a3a3a",
                  border:     `1px solid ${note !== app.adminNote ? "rgba(142,171,255,0.3)" : "transparent"}`,
                }}
              >
                {noteSaved ? <CheckIcon /> : <SaveIcon />}
                {noteSaved ? "저장됨" : "저장"}
              </button>
            </div>
          </Card>
        </div>

        {/* ── 오른쪽 ── */}
        <div className="flex flex-col gap-4">

          {/* 트레이너 배정 */}
          <Card title="담당 트레이너">
            {trainerEdit ? (
              <div className="flex flex-col gap-3">
                <select
                  value={selectedTrainerId}
                  onChange={(e) => setSelectedTrainerId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] outline-none"
                  style={{ background: "#0e0e0e", border: "1.5px solid #8eabff", color: "#ffffff" }}
                >
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTrainerEdit(false); setSelectedTrainerId(app.trainerId); }}
                    className="flex-1 py-2 rounded-xl text-[12.5px] font-medium"
                    style={{ background: "#1a1a1a", color: "#5a5a5a", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    취소
                  </button>
                  <button
                    onClick={saveTrainer}
                    disabled={trainerSaving}
                    className="flex-1 py-2 rounded-xl text-[12.5px] font-semibold transition-opacity disabled:opacity-50"
                    style={{ background: "rgba(142,171,255,0.15)", color: "#8eabff" }}
                  >
                    {trainerSaving ? "저장 중…" : "저장"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                    style={{ background: "#1f1f1f", color: "#8eabff" }}
                  >
                    {app.trainerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold" style={{ color: "#ffffff" }}>
                      {app.trainerName}
                    </p>
                    <p className="text-[11.5px]" style={{ color: "#3a3a3a" }}>트레이너</p>
                  </div>
                </div>
                <button
                  onClick={() => setTrainerEdit(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors"
                  style={{ background: "#1a1a1a", color: "#5a5a5a", border: "1px solid rgba(255,255,255,0.05)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#8eabff";
                    (e.currentTarget as HTMLElement).style.background = "rgba(142,171,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#5a5a5a";
                    (e.currentTarget as HTMLElement).style.background = "#1a1a1a";
                  }}
                >
                  <PersonIcon />
                  변경
                </button>
              </div>
            )}
          </Card>

          {/* 상태 변경 */}
          <Card title="상태 변경">
            <div className="flex flex-col gap-2">

              {/* 주요 액션 */}
              {next ? (
                <button
                  onClick={() => setModal(app.status === "pending" ? "confirm" : "complete")}
                  className="w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                  style={{ background: next.color, color: "#fff" }}
                >
                  <CheckIcon />
                  {next.label}
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-xl text-[13px] font-medium flex items-center justify-center"
                  style={{ background: "#1a1a1a", color: "#3a3a3a" }}>
                  {STATUS_LABEL[app.status]} 상태입니다.
                </div>
              )}

              {/* 취소 처리 */}
              {(app.status === "pending" || app.status === "confirmed") && (
                <button
                  onClick={() => setModal("cancel")}
                  className="w-full py-2.5 rounded-xl text-[12.5px] font-medium flex items-center justify-center gap-1.5 transition-opacity"
                  style={{ background: "rgba(248,113,113,0.06)", color: "#f87171", border: "1px solid rgba(248,113,113,0.12)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.12)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.06)")}
                >
                  <AlertIcon />
                  취소 처리
                </button>
              )}

              {/* 상태 흐름 안내 */}
              <div className="mt-1 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-center justify-between">
                  {(["pending","confirmed","completed"] as AppStatus[]).map((s, i, arr) => {
                    const isCurrentOrPast = ["pending","confirmed","completed"].indexOf(app.status) >= i;
                    const isCurrent = app.status === s;
                    return (
                      <div key={s} className="flex items-center gap-1.5">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{
                              background: isCurrent ? STATUS_STYLE[s].bg : isCurrentOrPast ? "rgba(255,255,255,0.08)" : "#1a1a1a",
                              color: isCurrent ? STATUS_STYLE[s].text : isCurrentOrPast ? "#5a5a5a" : "#2a2a2a",
                              border: isCurrent ? `1px solid ${STATUS_STYLE[s].border}` : "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            {i+1}
                          </div>
                          <p className="text-[9.5px] whitespace-nowrap" style={{ color: isCurrent ? STATUS_STYLE[s].text : "#2a2a2a" }}>
                            {STATUS_LABEL[s]}
                          </p>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-6 h-px mb-4" style={{ background: isCurrentOrPast && app.status !== s ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* ── 모달 ── */}
      {modal && (
        <ConfirmModal
          {...MODAL_CONFIG[modal]}
          loading={actionLoading}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && <Toast message={toast.msg} type={toast.type} />}

    </div>
  );
}

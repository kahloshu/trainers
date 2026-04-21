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
  pending:           { text: "#60a5fa", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.2)"  },
  received:          { text: "#60a5fa", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.2)"  },
  checking:          { text: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.2)"  },
  contact_scheduled: { text: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "rgba(167,139,250,0.2)" },
  scheduling:        { text: "#fb923c", bg: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.2)"  },
  confirmed:         { text: "#fbbf24", bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.2)"   },
  completed:         { text: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.2)"  },
  cancelled:         { text: "#5a5a5a", bg: "rgba(90,90,90,0.10)",    border: "rgba(90,90,90,0.2)"    },
};

const NEXT_STATUS: Partial<Record<AppStatus, { status: AppStatus; label: string; color: string }>> = {
  pending:           { status: "checking",          label: "확인 처리",  color: "#fbbf24" },
  received:          { status: "checking",          label: "확인 처리",  color: "#fbbf24" },
  checking:          { status: "contact_scheduled", label: "연락 예정",  color: "#a78bfa" },
  contact_scheduled: { status: "scheduling",        label: "일정 조율",  color: "#fb923c" },
  scheduling:        { status: "confirmed",         label: "확정 처리",  color: "#34d399" },
  confirmed:         { status: "completed",         label: "완료 처리",  color: "#2F6BFF" },
};

const STATUS_FLOW: AppStatus[] = ["received", "checking", "contact_scheduled", "scheduling", "confirmed", "completed"];

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
    <div className="dash-card-el rounded-2xl overflow-hidden" style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}>
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid var(--dash-border-sm)" }}>
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--dash-text-dimmed)" }}>{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── 정보 행 ── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid var(--dash-border-xs)" }}>
      <span className="text-[12.5px] flex-shrink-0" style={{ color: "var(--dash-text-muted)" }}>{label}</span>
      <span className="text-[13px] font-medium text-right leading-snug" style={{ color: "var(--dash-text-body)" }}>{value}</span>
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
      <div className="w-full max-w-[400px] rounded-2xl p-6 mx-4" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-modal-border)" }}>
        <h3 className="text-[17px] font-bold mb-2" style={{ color: "var(--dash-text)" }}>{title}</h3>
        <p className="text-[13px] leading-relaxed mb-6" style={{ color: "var(--dash-text-muted)" }}>{desc}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-[13.5px] font-medium"
            style={{ background: "var(--dash-card)", color: "var(--dash-text-sub)", border: "1px solid var(--dash-hover-btn)" }}>
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
      <div className="h-8 w-48 rounded-xl mb-6" style={{ background: "var(--dash-surface)" }} />
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="h-40 rounded-2xl" style={{ background: "var(--dash-card)" }} />
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
  const [modal, setModal]         = useState<null | "step" | "cancel">(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);

  /* 트레이너 배정용 */
  const [trainerEdit, setTrainerEdit]           = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [trainerSaving, setTrainerSaving]         = useState(false);

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
      pending:           "",
      received:          "접수 처리되었습니다.",
      checking:          "확인 처리되었습니다.",
      contact_scheduled: "연락 예정으로 변경되었습니다.",
      scheduling:        "일정 조율 중으로 변경되었습니다.",
      confirmed:         "확정 처리되었습니다.",
      completed:         "완료 처리되었습니다.",
      cancelled:         "취소 처리되었습니다.",
    };
    showToast(msgs[newStatus] || "상태가 변경되었습니다.");
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
    step: {
      title: next ? `${next.label}하시겠습니까?` : "",
      desc:  next?.status === "completed"
        ? "완료 처리 후에는 되돌리기 어렵습니다. 실제 진행이 완료된 경우에만 처리하세요."
        : "상태를 다음 단계로 진행합니다.",
      confirmLabel: next?.label ?? "",
      confirmColor: next?.color ?? "#2F6BFF",
      onConfirm: () => next && changeStatus(next.status),
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
          style={{ background: "var(--dash-surface)", color: "var(--dash-text-sub)", border: "1px solid var(--dash-border)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-sub)")}
        >
          <BackIcon />
        </button>
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: "var(--dash-text)" }}>신청 상세</h2>
          <p className="text-[12px]" style={{ color: "var(--dash-text-dimmed)" }}>#{id.slice(-8).toUpperCase()}</p>
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
                className="font-semibold" style={{ color: "#2F6BFF" }}>
                {app.applicantPhone}
              </a>
            } />
            <InfoRow label="신청일시" value={fmtDate(app.createdAt)} />
            <div className="pt-1.5">
              <p className="text-[12px]" style={{ color: "var(--dash-text-dimmed)" }}>
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
                    style={{ background: "rgba(47,107,255,0.08)", color: "#2F6BFF" }}>
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* 회원 요청사항 */}
          {app.userMessage && (
            <Card title="회원 요청사항">
              <p className="text-[13.5px] leading-relaxed italic" style={{ color: "var(--dash-text-sub)" }}>
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
              style={{ background: "var(--dash-input-bg)", border: "1.5px solid var(--dash-input-border)", color: "var(--dash-text)" }}
              onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
              onBlur={(e) => (e.target.style.borderColor = "var(--dash-input-border)")}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px]" style={{ color: "var(--dash-text-faint)" }}>{note.length} / 500</span>
              <button
                onClick={saveNote}
                disabled={note === app.adminNote}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30"
                style={{
                  background: note !== app.adminNote ? "rgba(47,107,255,0.12)" : "var(--dash-card)",
                  color:      note !== app.adminNote ? "#2F6BFF" : "var(--dash-text-dimmed)",
                  border:     `1px solid ${note !== app.adminNote ? "rgba(47,107,255,0.3)" : "transparent"}`,
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
                  style={{ background: "var(--dash-input-bg)", border: "1.5px solid #2F6BFF", color: "var(--dash-text)" }}
                >
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setTrainerEdit(false); setSelectedTrainerId(app.trainerId); }}
                    className="flex-1 py-2 rounded-xl text-[12.5px] font-medium"
                    style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}
                  >
                    취소
                  </button>
                  <button
                    onClick={saveTrainer}
                    disabled={trainerSaving}
                    className="flex-1 py-2 rounded-xl text-[12.5px] font-semibold transition-opacity disabled:opacity-50"
                    style={{ background: "rgba(47,107,255,0.15)", color: "#2F6BFF" }}
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
                    style={{ background: "var(--dash-avatar-bg)", color: "#2F6BFF" }}
                  >
                    {app.trainerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold" style={{ color: "var(--dash-text)" }}>
                      {app.trainerName}
                    </p>
                    <p className="text-[11.5px]" style={{ color: "var(--dash-text-dimmed)" }}>트레이너</p>
                  </div>
                </div>
                <button
                  onClick={() => setTrainerEdit(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors"
                  style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#2F6BFF";
                    (e.currentTarget as HTMLElement).style.background = "rgba(47,107,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)";
                    (e.currentTarget as HTMLElement).style.background = "var(--dash-surface)";
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
                  onClick={() => setModal("step")}
                  className="w-full py-3.5 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                  style={{ background: next.color, color: "#fff" }}
                >
                  <CheckIcon />
                  {next.label}
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-xl text-[13px] font-medium flex items-center justify-center"
                  style={{ background: "var(--dash-surface)", color: "var(--dash-text-dimmed)" }}>
                  {STATUS_LABEL[app.status]} 상태입니다.
                </div>
              )}

              {/* 취소 처리 */}
              {app.status !== "completed" && app.status !== "cancelled" && (
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
              <div className="mt-1 pt-3" style={{ borderTop: "1px solid var(--dash-border-sm)" }}>
                <div className="flex items-center justify-between">
                  {STATUS_FLOW.map((s, i, arr) => {
                    const flowIdx = STATUS_FLOW.indexOf(app.status === "pending" ? "received" : app.status);
                    const isCurrentOrPast = flowIdx >= i;
                    const isCurrent = app.status === s || (s === "received" && app.status === "pending");
                    return (
                      <div key={s} className="flex items-center gap-0.5">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                            style={{
                              background: isCurrent ? STATUS_STYLE[s].bg : isCurrentOrPast ? "var(--dash-toggle-off)" : "var(--dash-surface)",
                              color: isCurrent ? STATUS_STYLE[s].text : isCurrentOrPast ? "var(--dash-text-muted)" : "var(--dash-text-faint)",
                              border: isCurrent ? `1px solid ${STATUS_STYLE[s].border}` : "1px solid var(--dash-border-sm)",
                            }}
                          >
                            {i+1}
                          </div>
                          <p className="text-[8.5px] whitespace-nowrap" style={{ color: isCurrent ? STATUS_STYLE[s].text : "var(--dash-text-faint)" }}>
                            {STATUS_LABEL[s]}
                          </p>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-3 h-px mb-4 flex-shrink-0" style={{ background: isCurrentOrPast && !isCurrent ? "var(--dash-toggle-off)" : "var(--dash-border-sm)" }} />
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

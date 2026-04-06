"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  APPLICATIONS,
  STATUS_LABEL,
  DAY_LABEL,
  TIME_LABEL,
  timeAgoLabel,
  type AppStatus,
} from "@/app/data/applications";

/* ── 상태 색상 ── */
const STATUS_COLOR: Record<AppStatus, { bg: string; text: string; dot: string; border: string }> = {
  pending:   { bg: "rgba(248,113,113,0.10)",   text: "#f87171", dot: "#f87171", border: "rgba(248,113,113,0.2)"   },
  confirmed: { bg: "rgba(234,179,8,0.1)",   text: "#fbbf24", dot: "#eab308", border: "rgba(234,179,8,0.2)"   },
  completed: { bg: "rgba(52,211,153,0.10)",  text: "#34d399", dot: "#10b981", border: "rgba(52,211,153,0.2)"  },
  cancelled: { bg: "rgba(90,90,90,0.10)", text: "#a0a0a0", dot: "#5a5a5a", border: "rgba(90,90,90,0.2)" },
};

/* ── 상태 흐름 ── */
const NEXT_STATUS: Partial<Record<AppStatus, { status: AppStatus; label: string; color: string }>> = {
  pending:   { status: "confirmed", label: "확정하기",  color: "#34d399" },
  confirmed: { status: "completed", label: "완료 처리", color: "#8eabff" },
};

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#ffffff" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.97-.97a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21.72 16.92z"
        stroke="#8eabff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke="#f87171" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── 섹션 블록 래퍼 ── */
function Block({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
      {children}
    </div>
  );
}

/* ── 블록 헤더 ── */
function BlockHeader({ label }: { label: string }) {
  return (
    <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#3a3a3a" }}>
        {label}
      </p>
    </div>
  );
}

/* ── 정보 행 ── */
function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 py-3.5 px-5">
        <span className="text-[13px] flex-shrink-0" style={{ color: "#5a5a5a" }}>{label}</span>
        <span className="text-[13px] font-medium text-right leading-snug" style={{ color: "#ffffff" }}>
          {value}
        </span>
      </div>
      {!last && <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.04)" }} />}
    </>
  );
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }: { status: AppStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
      {STATUS_LABEL[status]}
    </span>
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

/* ── 확인 팝업 ── */
function ConfirmModal({
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

/* ── 토스트 ── */
function Toast({ message }: { message: string }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-[13px] font-semibold shadow-lg"
      style={{ background: "#34d399", color: "#fff", whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}

/* ── 페이지 ── */
export default function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const found = APPLICATIONS.find((a) => a.id === id);
  if (!found) notFound();

  const [app, setApp]           = useState(found);
  const [note, setNote]         = useState(app.adminNote);
  const [noteSaved, setNoteSaved] = useState(false);
  const [modal, setModal]       = useState<null | "confirm" | "complete" | "cancel">(null);
  const [toast, setToast]       = useState("");

  const days  = app.preferredDays.map((d)  => DAY_LABEL[d]  ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");
  const next  = NEXT_STATUS[app.status];

  /* 토스트 표시 */
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  /* 메모 저장 */
  function saveNote() {
    setApp((prev) => ({ ...prev, adminNote: note }));
    setNoteSaved(true);
    showToast("메모가 저장되었습니다.");
    setTimeout(() => setNoteSaved(false), 1800);
  }

  /* 상태 변경 */
  function changeStatus(newStatus: AppStatus) {
    setApp((prev) => ({ ...prev, status: newStatus }));
    setModal(null);
    const labels: Record<AppStatus, string> = {
      confirmed: "확정 처리되었습니다.",
      completed: "완료 처리되었습니다.",
      cancelled: "취소 처리되었습니다.",
      pending: "",
    };
    showToast(labels[newStatus]);
  }

  /* 모달 설정 */
  const MODAL_CONFIG = {
    confirm: {
      title: "이 신청을 확정하시겠습니까?",
      desc:  "확정 후 회원에게 연락하여 일정을 조율해 주세요.",
      confirmLabel: "확정하기",
      confirmColor: "#34d399",
      onConfirm: () => changeStatus("confirmed"),
    },
    complete: {
      title: "OT가 완료되었습니까?",
      desc:  "완료 처리 후 회원이 후기를 작성할 수 있습니다.",
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
        <span className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>신청 상세</span>
        <div className="w-9" />
      </header>

      {/* ── 본문 ── */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-40">

        {/* 상태 + 신청번호 */}
        <div className="flex items-center justify-between">
          <StatusBadge status={app.status} />
          <div className="text-right">
            <p className="text-[11px]" style={{ color: "#3a3a3a" }}>신청번호</p>
            <p className="text-[12px] font-semibold" style={{ color: "#5a5a5a" }}>#{app.id.toUpperCase()}</p>
          </div>
        </div>

        {/* 신청 시각 */}
        <p className="text-[12px]" style={{ color: "#3a3a3a" }}>
          {timeAgoLabel(app.createdMinutesAgo)} 신청
        </p>

        {/* ── 신청자 정보 ── */}
        <Block>
          <BlockHeader label="신청자 정보" />
          <InfoRow label="이름" value={app.applicantName} />
          <InfoRow
            label="연락처"
            last
            value={
              <a
                href={`tel:${app.applicantPhone.replace(/-/g, "")}`}
                className="flex items-center gap-1.5 font-semibold transition-opacity active:opacity-70"
                style={{ color: "#8eabff" }}
              >
                <PhoneIcon />
                {app.applicantPhone}
              </a>
            }
          />
        </Block>

        {/* ── 신청 트레이너 ── */}
        <Block>
          <BlockHeader label="신청 트레이너" />
          <div className="flex items-center gap-3 px-5 py-4">
            <MiniAvatar name={app.trainerName} />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "#ffffff" }}>
                {app.trainerName} 트레이너
              </p>
            </div>
          </div>
        </Block>

        {/* ── 희망 일정 ── */}
        <Block>
          <BlockHeader label="희망 일정" />
          <InfoRow label="희망 요일"   value={days}  />
          <InfoRow label="희망 시간대" value={times} last />
        </Block>

        {/* ── 운동 목적 (있을 때) ── */}
        {app.purposes.length > 0 && (
          <Block>
            <BlockHeader label="운동 목적" />
            <div className="flex flex-wrap gap-2 px-5 py-4">
              {app.purposes.map((p) => (
                <span key={p} className="px-3 py-1 rounded-full text-[12px] font-medium"
                  style={{ background: "rgba(142,171,255,0.08)", color: "#8eabff" }}>
                  {p}
                </span>
              ))}
            </div>
          </Block>
        )}

        {/* ── 회원 요청사항 (있을 때) ── */}
        {app.userMessage && (
          <Block>
            <BlockHeader label="회원 요청사항" />
            <div className="px-5 py-4">
              <p className="text-[13.5px] leading-relaxed italic" style={{ color: "#a0a0a0" }}>
                &ldquo;{app.userMessage}&rdquo;
              </p>
            </div>
          </Block>
        )}

        {/* ── 관리자 메모 ── */}
        <Block>
          <BlockHeader label="관리자 메모 (비공개)" />
          <div className="p-4">
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value.slice(0, 300)); setNoteSaved(false); }}
              placeholder={"트레이너 연락 여부, 일정 조율 내용 등을 기록해 두세요.\n관리자만 볼 수 있습니다."}
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl text-[13px] outline-none resize-none leading-relaxed transition-all"
              style={{ background: "#0e0e0e", border: "1.5px solid rgba(255,255,255,0.06)", color: "#ffffff" }}
              onFocus={(e)  => (e.target.style.borderColor = "#8eabff")}
              onBlur={(e)   => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.06)" }}>{note.length} / 300</span>
              <button
                onClick={saveNote}
                disabled={note === app.adminNote}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                style={{
                  background: note !== app.adminNote ? "rgba(142,171,255,0.12)" : "#131313",
                  color:      note !== app.adminNote ? "#8eabff" : "rgba(255,255,255,0.06)",
                  border:     `1px solid ${note !== app.adminNote ? "rgba(142,171,255,0.3)" : "#131313"}`,
                }}
              >
                {noteSaved ? <CheckIcon color="#34d399" /> : <SaveIcon />}
                {noteSaved ? "저장됨" : "저장"}
              </button>
            </div>
          </div>
        </Block>

        {/* ── 상태 변경 ── */}
        <Block>
          <BlockHeader label="상태 변경" />
          <div className="p-4 flex flex-col gap-2.5">

            {/* 주요 액션 */}
            {next ? (
              <button
                onClick={() => setModal(app.status === "pending" ? "confirm" : "complete")}
                className="w-full py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                style={{ background: next.color, color: "#fff" }}
              >
                <CheckIcon />
                {next.label}
              </button>
            ) : (
              <div className="w-full py-3.5 rounded-2xl text-[13px] font-medium flex items-center justify-center"
                style={{ background: "#131313", color: "#3a3a3a" }}>
                {STATUS_LABEL[app.status]} 상태입니다.
              </div>
            )}

            {/* 취소 처리 */}
            {(app.status === "pending" || app.status === "confirmed") && (
              <button
                onClick={() => setModal("cancel")}
                className="w-full py-3 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-opacity active:opacity-70"
                style={{ color: "#f87171" }}
              >
                <WarningIcon />
                취소 처리
              </button>
            )}
          </div>
        </Block>

      </div>

      {/* ── 모달 ── */}
      {modal && (
        <ConfirmModal
          {...MODAL_CONFIG[modal]}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && <Toast message={toast} />}

    </div>
  );
}

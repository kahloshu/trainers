"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTrainerById, type Trainer } from "@/app/data/trainers";
import { addApplication } from "@/app/data/applications";
import { notFound } from "next/navigation";

/* ────────────── 아이콘 ────────────── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#fbfafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarFilled() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#c9a96e" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#2f80ed" strokeWidth="1.6" />
      <path d="M12 11v5" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="0.8" fill="#2f80ed" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M13 6L19 12L13 18" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ────────────── 레이블 ────────────── */
function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[13.5px] font-semibold" style={{ color: "#fbfafa" }}>
        {children}
      </span>
      {required && (
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(47,128,237,0.15)", color: "#2f80ed" }}
        >
          필수
        </span>
      )}
      {!required && (
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: "#2a2a2a", color: "#6b7280" }}
        >
          선택
        </span>
      )}
      {hint && (
        <span className="text-[11px] ml-auto" style={{ color: "#4b5563" }}>
          {hint}
        </span>
      )}
    </div>
  );
}

/* ────────────── 구분선 ────────────── */
function Divider() {
  return <div className="h-px mx-4" style={{ background: "#2a2a2a" }} />;
}

/* ────────────── 토글 버튼 ────────────── */
function ToggleBtn({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center py-3.5 px-2 rounded-xl border transition-all duration-150 active:scale-95"
      style={{
        background: selected ? "#2f80ed" : "#252525",
        borderColor: selected ? "#2f80ed" : "#383838",
      }}
    >
      {selected && (
        <span className="mb-0.5">
          <CheckIcon />
        </span>
      )}
      <span
        className="text-[13.5px] font-semibold"
        style={{ color: selected ? "#fff" : "#9ca3af" }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="text-[10.5px] mt-0.5"
          style={{ color: selected ? "rgba(255,255,255,0.65)" : "#4b5563" }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

/* ────────────── 이니셜 아바타 ────────────── */
function MiniAvatar({ name }: { name: string }) {
  const colors = ["#1a4a8a", "#1a6a3a", "#4a1a8a", "#8a1a1a", "#6a6a1a", "#1a6a6a"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
      style={{ background: bg }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* ────────────── 목적 칩 ────────────── */
const PURPOSES = ["다이어트", "근력 향상", "체형 교정", "재활·통증", "체력 증진", "기타"];

const DAYS = [
  { id: "weekday", label: "평일", sub: "Mon – Fri" },
  { id: "saturday", label: "토요일", sub: "Sat" },
  { id: "sunday", label: "일요일", sub: "Sun" },
];

const TIMES = [
  { id: "morning", label: "오전", sub: "~ 12시" },
  { id: "afternoon", label: "오후", sub: "12 – 17시" },
  { id: "evening", label: "저녁", sub: "17시 ~" },
];

/* ────────────── 페이지 ────────────── */
export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [trainer, setTrainer] = useState<Trainer | null | "loading">("loading");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purposes, setPurposes] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTrainerById(id).then((t) => setTrainer(t ?? null));
  }, [id]);

  /* 에러 포커스용 ref */
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const timesRef = useRef<HTMLDivElement>(null);

  /* 전화번호 자동 포맷 */
  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function toggleArr(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  const isValid = name.trim() && phone.length >= 12 && days.length > 0 && times.length > 0;

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (trainer === "loading") return (
    <div className="min-h-dvh animate-pulse" style={{ background: "#1e1e1e" }}>
      <div className="h-14 mx-4 mt-4 rounded-2xl" style={{ background: "#252525" }} />
    </div>
  );
  if (trainer === null) notFound();

  async function handleSubmit() {
    if (!trainer || trainer === "loading") return;
    if (!name.trim()) { scrollTo(nameRef); return; }
    if (phone.length < 12) { scrollTo(phoneRef); return; }
    if (days.length === 0) { scrollTo(daysRef); return; }
    if (times.length === 0) { scrollTo(timesRef); return; }

    setSubmitting(true);
    const appNo = await addApplication({
      applicantName:  name.trim(),
      applicantPhone: phone,
      trainerId:      id,
      trainerName:    trainer.name,
      purposes,
      preferredDays:  days,
      preferredTimes: times,
      userMessage:    message,
      status:         "received",
    });
    if (appNo) {
      const prev = JSON.parse(localStorage.getItem("jg_my_apps") ?? "[]") as string[];
      localStorage.setItem("jg_my_apps", JSON.stringify([...prev, appNo]));
    }
    router.replace(
      `/trainer/${id}/apply/done?name=${encodeURIComponent(name)}&trainer=${encodeURIComponent(trainer.name)}&days=${days.join(",")}&times=${times.join(",")}&appNo=${encodeURIComponent(appNo ?? "")}`
    );
  }

  return (
    <div className="min-h-dvh" style={{ background: "#1e1e1e" }}>
      {/* ── 상단 네비 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(30,30,30,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#2a2a2a" }}
        >
          <BackIcon />
        </button>
        <span className="text-[15px] font-semibold" style={{ color: "#fbfafa" }}>
          OT 신청
        </span>
        <div className="w-9" />
      </header>

      {/* ── 폼 ── */}
      <div className="flex flex-col gap-px pb-36">

        {/* 선택된 트레이너 (고정 표시, 변경 불가) */}
        <div className="px-4 pt-5 pb-4">
          <p className="text-[10.5px] font-semibold tracking-[0.15em] uppercase mb-3" style={{ color: "#4b5563" }}>
            신청 트레이너
          </p>
          <div
            className="flex items-center gap-3 p-3.5 rounded-2xl border"
            style={{ background: "#252525", borderColor: "#303030" }}
          >
            <MiniAvatar name={trainer.name} />
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] font-semibold leading-tight" style={{ color: "#fbfafa" }}>
                {trainer.name} 트레이너
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "#6b7280" }}>
                {trainer.specialty}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <StarFilled />
              <span className="text-[12px] font-medium" style={{ color: "#c9a96e" }}>
                {trainer.ratingAvg.toFixed(1)}
              </span>
            </div>
          </div>
          <p className="text-[11px] mt-2 text-center" style={{ color: "#383838" }}>
            트레이너는 변경할 수 없습니다
          </p>
        </div>

        <Divider />

        {/* 이름 */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel required>이름</FieldLabel>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해 주세요"
            className="w-full px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all"
            style={{
              background: "#252525",
              border: "1.5px solid #383838",
              color: "#fbfafa",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
            onBlur={(e) => (e.target.style.borderColor = "#383838")}
          />
        </div>

        <Divider />

        {/* 연락처 */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel required>연락처</FieldLabel>
          <input
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all"
            style={{
              background: "#252525",
              border: "1.5px solid #383838",
              color: "#fbfafa",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
            onBlur={(e) => (e.target.style.borderColor = "#383838")}
          />
          <p className="text-[11.5px] mt-2" style={{ color: "#4b5563" }}>
            트레이너가 이 번호로 직접 연락드립니다.
          </p>
        </div>

        <Divider />

        {/* 운동 목적 */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel hint="중복 선택 가능">운동 목적</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map((p) => {
              const on = purposes.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurposes(toggleArr(purposes, p))}
                  className="px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all duration-150 active:scale-95"
                  style={{
                    background: on ? "#2f80ed" : "#252525",
                    borderColor: on ? "#2f80ed" : "#383838",
                    color: on ? "#fff" : "#9ca3af",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* 희망 요일 */}
        <div className="px-4 pt-5 pb-4" ref={daysRef}>
          <FieldLabel required hint="중복 선택 가능">희망 가능 요일</FieldLabel>
          <div className="flex gap-2">
            {DAYS.map((d) => (
              <ToggleBtn
                key={d.id}
                label={d.label}
                sub={d.sub}
                selected={days.includes(d.id)}
                onClick={() => setDays(toggleArr(days, d.id))}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* 희망 시간대 */}
        <div className="px-4 pt-5 pb-4" ref={timesRef}>
          <FieldLabel required hint="중복 선택 가능">희망 시간대</FieldLabel>
          <div className="flex gap-2">
            {TIMES.map((t) => (
              <ToggleBtn
                key={t.id}
                label={t.label}
                sub={t.sub}
                selected={times.includes(t.id)}
                onClick={() => setTimes(toggleArr(times, t.id))}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* 요청사항 */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel>요청사항</FieldLabel>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            placeholder={"트레이너에게 미리 전달할 내용을 적어주세요.\n(부상 이력, 건강 상태, 운동 경험 등)"}
            rows={4}
            className="w-full px-4 py-3.5 rounded-xl text-[13.5px] outline-none resize-none leading-relaxed transition-all"
            style={{
              background: "#252525",
              border: "1.5px solid #383838",
              color: "#fbfafa",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
            onBlur={(e) => (e.target.style.borderColor = "#383838")}
          />
          <p className="text-[11px] text-right mt-1.5" style={{ color: "#4b5563" }}>
            {message.length} / 200
          </p>
        </div>

        {/* 안내 문구 */}
        <div className="px-4 pt-1 pb-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: "#252525", border: "1px solid #2f2f2f" }}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex-shrink-0">
                <InfoIcon />
              </span>
              <p
                className="text-[12.5px] leading-[1.8]"
                style={{ color: "#6b7280" }}
              >
                선택하신 시간은 희망 일정이며,{" "}
                <span style={{ color: "#9ca3af" }}>
                  정확한 수업 일정은 트레이너와 조율을 통해 확정됩니다.
                </span>
                <br />
                <br />
                트레이너의 수업 일정에 따라 안내까지 다소 시간이 소요될 수 있으며,
                확인되는 대로 순차적으로 연락드리겠습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 고정 버튼 ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pt-3 pb-6"
        style={{
          background: "linear-gradient(to top, #1e1e1e 70%, transparent)",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-200"
          style={{
            background: isValid && !submitting ? "#2f80ed" : "#252525",
            color: isValid && !submitting ? "#fff" : "#4b5563",
            cursor: isValid && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="30 56" />
              </svg>
              신청 중...
            </span>
          ) : (
            <>
              <span>신청 완료하기</span>
              {isValid && <ArrowIcon />}
            </>
          )}
        </button>

        {!isValid && (
          <p className="text-center text-[11.5px] mt-2" style={{ color: "#383838" }}>
            {!name.trim()
              ? "이름을 입력해 주세요"
              : phone.length < 12
              ? "연락처를 입력해 주세요"
              : days.length === 0
              ? "희망 요일을 선택해 주세요"
              : "희망 시간대를 선택해 주세요"}
          </p>
        )}
      </div>
    </div>
  );
}

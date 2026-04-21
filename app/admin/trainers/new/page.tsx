"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addTrainer } from "@/app/data/trainers";

const TAG_OPTIONS = ["근력 향상", "다이어트", "재활 트레이닝", "체형 교정", "필라테스", "체력 증진"];

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#ffffff" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon({ color = "#2F6BFF" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="#5a5a5a" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="#5a5a5a" strokeWidth="1.6" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 13L9 17L19 7" stroke="#fff" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M17 21v-8H7v8M7 3v5h8"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ── 공통 컴포넌트 ── */
function Divider() {
  return <div className="h-px mx-4" style={{ background: "rgba(255,255,255,0.04)" }} />;
}

function FieldLabel({
  children,
  required,
  count,
  max,
}: {
  children: React.ReactNode;
  required?: boolean;
  count?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[13.5px] font-semibold" style={{ color: "#ffffff" }}>
        {children}
      </span>
      {required && (
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
          style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}
        >
          필수
        </span>
      )}
      {count !== undefined && max !== undefined && (
        <span
          className="ml-auto text-[11px]"
          style={{ color: count >= max ? "#f87171" : "#3a3a3a" }}
        >
          {count} / {max}
        </span>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all"
      style={{ background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,0.06)", color: "#ffffff" }}
      onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3.5 rounded-xl text-[13.5px] outline-none resize-none leading-relaxed transition-all"
      style={{ background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,0.06)", color: "#ffffff" }}
      onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
    />
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

/* ── 이니셜 아바타 ── */
function Avatar({ name }: { name: string }) {
  const gradients = [
    "linear-gradient(135deg,#0f1f3d,#2f80ed)",
    "linear-gradient(135deg,#0f2d1a,#34d399)",
    "linear-gradient(135deg,#1f0f3d,#a78bfa)",
    "linear-gradient(135deg,#3d0f0f,#f87171)",
    "linear-gradient(135deg,#2d2d0f,#fbbf24)",
    "linear-gradient(135deg,#0f2d2d,#22d3ee)",
  ];
  const idx = name ? name.charCodeAt(0) % gradients.length : 0;
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: name ? gradients[idx] : "#1a1a1a" }}
    >
      {name ? (
        <span className="text-4xl font-bold text-white/80">{name.charAt(0)}</span>
      ) : (
        <>
          <CameraIcon />
          <span className="text-[11px] font-medium" style={{ color: "#5a5a5a" }}>
            사진 추가
          </span>
        </>
      )}
    </div>
  );
}

/* ── 페이지 ── */
export default function TrainerNewPage() {
  const router = useRouter();

  /* 폼 상태 */
  const [name,      setName]      = useState("");
  const [spec,      setSpec]      = useState("");
  const [years,     setYears]     = useState("");
  const [bio,       setBio]       = useState("");
  const [intro,     setIntro]     = useState("");
  const [certs,     setCerts]     = useState<string[]>([]);
  const [tags,      setTags]      = useState<string[]>([]);
  const [active,    setActive]    = useState(true);
  const [certInput, setCertInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast,     setToast]     = useState("");
  const [imageUrl,  setImageUrl]  = useState("");
  const certRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 600;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageUrl(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = objectUrl;
  }

  const isValid = name.trim() && spec.trim() && years.trim() && bio.trim();

  /* 자격증 추가 */
  function addCert() {
    const val = certInput.trim();
    if (!val || certs.includes(val) || certs.length >= 10) return;
    setCerts((prev) => [...prev, val]);
    setCertInput("");
    certRef.current?.focus();
  }

  /* 자격증 삭제 */
  function removeCert(i: number) {
    setCerts((prev) => prev.filter((_, idx) => idx !== i));
  }

  /* 태그 토글 */
  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  /* 저장 */
  async function handleSave() {
    if (!isValid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    await addTrainer({
      id: `t-${Date.now()}`,
      name:          name.trim(),
      specialty:     spec.trim(),
      careerYears:   Number(years),
      shortBio:      bio.trim(),
      introduction:  intro.trim(),
      certifications: certs,
      tags,
      profileImage:  imageUrl,
      galleryImages: [],
    });
    setSubmitting(false);
    setToast("등록되었습니다.");
    setTimeout(() => { setToast(""); router.push("/admin/trainers"); }, 1400);
  }

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(14,14,14,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/admin/trainers")}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#131313" }}
        >
          <BackIcon />
        </button>
        <span className="text-[15px] font-semibold" style={{ color: "#ffffff" }}>
          트레이너 등록
        </span>
        {/* 헤더 우측 저장 버튼 */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || submitting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-opacity active:opacity-80"
          style={{
            background: isValid ? "rgba(47,107,255,0.12)" : "transparent",
            color:      isValid ? "#2F6BFF" : "rgba(255,255,255,0.06)",
          }}
        >
          <SaveIcon />
          저장
        </button>
      </header>

      <div className="flex flex-col gap-px pb-36">

        {/* ── 프로필 사진 ── */}
        <div className="flex flex-col items-center px-4 pt-6 pb-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-28 h-28 rounded-2xl overflow-hidden mb-3 active:opacity-80 transition-opacity"
            style={{ border: "1.5px solid rgba(255,255,255,0.06)" }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              <Avatar name={name} />
            )}

            {/* 사진이 있을 때만 카메라 오버레이 */}
            {imageUrl && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-end pb-3 gap-1 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
              >
                <CameraIcon />
                <span className="text-[10px] text-white/80 font-medium">사진 변경</span>
              </div>
            )}
          </button>

          {imageUrl ? (
            <button
              type="button"
              onClick={() => { setImageUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-[12px] font-medium transition-opacity active:opacity-70"
              style={{ color: "#f87171" }}
            >
              사진 삭제
            </button>
          ) : (
            <p className="text-[11.5px]" style={{ color: "#3a3a3a" }}>
              탭하여 프로필 사진을 등록하세요.
            </p>
          )}
        </div>

        <Divider />

        {/* ── 이름 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel required>이름</FieldLabel>
          <TextInput
            value={name}
            onChange={setName}
            placeholder="트레이너 이름"
          />
        </div>

        <Divider />

        {/* ── 전문 분야 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel required>전문 분야</FieldLabel>
          <TextInput
            value={spec}
            onChange={setSpec}
            placeholder="예: 퍼스널 트레이닝"
          />
        </div>

        <Divider />

        {/* ── 경력 연수 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel required>경력 연수</FieldLabel>
          <div className="relative">
            <TextInput
              value={years}
              onChange={(v) => setYears(v.replace(/\D/g, "").slice(0, 2))}
              placeholder="0"
              type="tel"
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium"
              style={{ color: "#5a5a5a" }}
            >
              년차
            </span>
          </div>
        </div>

        <Divider />

        {/* ── 한줄 소개 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel required count={bio.length} max={50}>한줄 소개</FieldLabel>
          <TextInput
            value={bio}
            onChange={(v) => setBio(v.slice(0, 50))}
            placeholder="리스트 카드에 표시되는 한줄 소개"
          />
        </div>

        <Divider />

        {/* ── 상세 소개 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel count={intro.length} max={500}>상세 소개</FieldLabel>
          <Textarea
            value={intro}
            onChange={(v) => setIntro(v.slice(0, 500))}
            placeholder="트레이너 상세 페이지에 표시되는 소개글을 작성해 주세요."
            rows={5}
          />
        </div>

        <Divider />

        {/* ── 자격증 및 경력 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel>자격증 및 경력</FieldLabel>

          {/* 입력 행 */}
          <div className="flex gap-2 mb-3">
            <input
              ref={certRef}
              type="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCert()}
              placeholder="자격증 또는 경력 입력 후 추가"
              className="flex-1 px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all"
              style={{ background: "#1a1a1a", border: "1.5px solid rgba(255,255,255,0.06)", color: "#ffffff" }}
              onFocus={(e) => (e.target.style.borderColor = "#2F6BFF")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.06)")}
            />
            <button
              type="button"
              onClick={addCert}
              disabled={!certInput.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 transition-opacity active:opacity-70"
              style={{
                background:  certInput.trim() ? "#1a55d4" : "#1a1a1a",
                border: `1.5px solid ${certInput.trim() ? "#1a55d4" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <PlusIcon color={certInput.trim() ? "#fff" : "#3a3a3a"} />
            </button>
          </div>

          {/* 추가된 항목 목록 */}
          {certs.length === 0 ? (
            <p className="text-[12px] py-2" style={{ color: "#3a3a3a" }}>
              추가된 자격증 또는 경력이 없습니다.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {certs.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl"
                  style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <span className="text-[13px] leading-snug flex-1 mr-2" style={{ color: "#d0d0d0" }}>
                    {c}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCert(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-opacity active:opacity-70"
                    style={{ color: "#f87171", background: "rgba(248,113,113,0.10)" }}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.06)" }}>
            최대 10개 · Enter 또는 + 버튼으로 추가
          </p>
        </div>

        <Divider />

        {/* ── 전문 분야 태그 ── */}
        <div className="px-4 pt-5 pb-4">
          <FieldLabel>전문 분야 태그</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-all duration-150 active:scale-95"
                  style={{
                    background:  on ? "#1a55d4" : "#1a1a1a",
                    borderColor: on ? "#1a55d4" : "rgba(255,255,255,0.06)",
                    color:       on ? "#fff"    : "#a0a0a0",
                  }}
                >
                  {on && <CheckIcon />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <Divider />

        {/* ── 노출 여부 ── */}
        <div className="px-4 pt-5 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold mb-0.5" style={{ color: "#ffffff" }}>
                회원 리스트 노출
              </p>
              <p className="text-[12px]" style={{ color: "#5a5a5a" }}>
                {active ? "등록 후 즉시 회원에게 노출됩니다." : "등록 후 숨김 상태로 유지됩니다."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActive((p) => !p)}
              className="relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0"
              style={{ background: active ? "#1a55d4" : "rgba(255,255,255,0.06)" }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                style={{ left: active ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
          </div>
        </div>

        {/* ── 필수 항목 안내 ── */}
        <div className="mx-4 mb-2 px-4 py-3.5 rounded-2xl" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[12px] leading-relaxed" style={{ color: "#5a5a5a" }}>
            <span style={{ color: "#2F6BFF" }}>필수</span> 항목(이름, 전문 분야, 경력 연수, 한줄 소개)을 모두 입력해야 등록할 수 있습니다.
          </p>
        </div>

      </div>

      {/* ── 하단 고정 등록 버튼 ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pt-3"
        style={{
          background: "linear-gradient(to top, #0e0e0e 70%, transparent)",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-[15px] transition-all duration-200"
          style={{
            background: isValid && !submitting ? "linear-gradient(135deg, #2F6BFF 0%, #1a55d4 100%)" : "#1a1a1a",
            color:      isValid && !submitting ? "#fff"    : "#3a3a3a",
            cursor:     isValid && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"
                  strokeDasharray="30 56" />
              </svg>
              등록 중...
            </span>
          ) : (
            <>
              <SaveIcon />
              <span>트레이너 등록하기</span>
            </>
          )}
        </button>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

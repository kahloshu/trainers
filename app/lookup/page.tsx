"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getApplicationByNumber,
  getApplicationsByContact,
  STATUS_LABEL,
  STATUS_COLOR,
  DAY_LABEL,
  TIME_LABEL,
  maskPhone,
  type Application,
} from "@/app/data/applications";

/* ── 아이콘 ── */
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="#fbfafa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function MessageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 날짜 포맷 ── */
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/* ── 상태 뱃지 ── */
function StatusBadge({ status }: { status: Application["status"] }) {
  const c = STATUS_COLOR[status] ?? STATUS_COLOR.cancelled;
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full"
      style={{ background: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ── 결과 카드 ── */
function ResultCard({ app }: { app: Application }) {
  const days  = app.preferredDays.map((d) => DAY_LABEL[d] ?? d).join(", ");
  const times = app.preferredTimes.map((t) => TIME_LABEL[t] ?? t).join(", ");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#252525", border: "1px solid #2f2f2f" }}>

      {/* 신청번호 헤더 */}
      {app.applicationNumber && (
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ background: "rgba(47,128,237,0.07)", borderBottom: "1px solid rgba(47,128,237,0.12)" }}>
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#4b7dba" }}>
            신청번호
          </span>
          <span className="text-[13px] font-black tracking-widest" style={{ color: "#7ab3ef" }}>
            {app.applicationNumber}
          </span>
        </div>
      )}

      <div className="px-5 py-4 flex flex-col gap-3.5">

        {/* 트레이너 + 상태 */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold" style={{ color: "#fbfafa" }}>
              {app.trainerName} 트레이너
            </p>
            <p className="text-[11.5px] mt-0.5" style={{ color: "#4b5563" }}>
              신청일 {fmtDate(app.createdAt)}
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <div className="h-px" style={{ background: "#2a2a2a" }} />

        {/* 희망 일정 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span style={{ color: "#4b5563" }}><CalendarIcon /></span>
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>{days || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: "#4b5563" }}><ClockIcon /></span>
            <span className="text-[13px]" style={{ color: "#9ca3af" }}>{times || "—"}</span>
          </div>
        </div>

        {/* 요청사항 */}
        {app.userMessage && (
          <div className="rounded-xl px-3.5 py-3" style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span style={{ color: "#4b5563" }}><MessageIcon /></span>
              <span className="text-[10.5px] font-semibold" style={{ color: "#4b5563" }}>요청사항</span>
            </div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b7280" }}>
              {app.userMessage}
            </p>
          </div>
        )}

        {/* 관리자 메모 */}
        {app.adminNote && (
          <div className="rounded-xl px-3.5 py-3"
            style={{ background: "rgba(47,107,255,0.06)", border: "1px solid rgba(47,107,255,0.12)" }}>
            <p className="text-[10.5px] font-semibold mb-1" style={{ color: "#2F6BFF" }}>관리자 메모</p>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b7280" }}>{app.adminNote}</p>
          </div>
        )}

        {/* 연락처 (마스킹) */}
        <p className="text-[11.5px]" style={{ color: "#3a3a3a" }}>
          연락처: {maskPhone(app.applicantPhone)}
        </p>
      </div>
    </div>
  );
}

/* ── 탭 입력 폼 ── */
type Tab = "number" | "contact";

/* ── 전화번호 자동 포맷 ── */
function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/* ── 메인 콘텐츠 ── */
function LookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("number");

  /* 신청번호 탭 */
  const [appNoInput, setAppNoInput] = useState(searchParams.get("appNo") ?? "");

  /* 이름+전화번호 탭 */
  const [nameInput, setNameInput]   = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  /* 결과 상태 */
  const [results, setResults]       = useState<Application[]>([]);
  const [searched, setSearched]     = useState(false);
  const [loading, setLoading]       = useState(false);

  /* URL에 appNo가 있으면 자동 조회 */
  useEffect(() => {
    const no = searchParams.get("appNo");
    if (no) {
      setTab("number");
      setAppNoInput(no);
      searchByNumber(no);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchByNumber(no?: string) {
    const query = (no ?? appNoInput).trim().toUpperCase();
    if (!query) return;
    setLoading(true);
    setSearched(false);
    const app = await getApplicationByNumber(query);
    setResults(app ? [app] : []);
    setSearched(true);
    setLoading(false);
  }

  async function searchByContact() {
    if (!nameInput.trim() || phoneInput.length < 12) return;
    setLoading(true);
    setSearched(false);
    const apps = await getApplicationsByContact(nameInput.trim(), phoneInput.trim());
    setResults(apps);
    setSearched(true);
    setLoading(false);
  }

  function switchTab(t: Tab) {
    setTab(t);
    setResults([]);
    setSearched(false);
  }

  const inputClass = "w-full px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all";
  const inputStyle = { background: "#252525", border: "1.5px solid #383838", color: "#fbfafa" };

  return (
    <div className="min-h-dvh" style={{ background: "#1e1e1e" }}>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(30,30,30,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#2a2a2a" }}>
          <BackIcon />
        </button>
        <span className="text-[15px] font-semibold" style={{ color: "#fbfafa" }}>신청 조회</span>
        <div className="w-9" />
      </header>

      <div className="px-4 pt-6 pb-32 flex flex-col gap-5">

        {/* 탭 */}
        <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: "#252525" }}>
          {([["number", "신청번호 조회"], ["contact", "이름 + 전화번호"]] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => switchTab(id)}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
              style={{
                background: tab === id ? "#2f80ed" : "transparent",
                color:      tab === id ? "#ffffff" : "#6b7280",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* 신청번호 탭 */}
        {tab === "number" && (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[12px] font-semibold mb-2" style={{ color: "#6b7280" }}>
                신청 완료 후 받은 신청번호를 입력해 주세요
              </p>
              <input
                type="text"
                value={appNoInput}
                onChange={(e) => setAppNoInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && searchByNumber()}
                placeholder="예: JG-2026-ABC123"
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
                onBlur={(e) => (e.target.style.borderColor = "#383838")}
              />
            </div>
            <button
              onClick={() => searchByNumber()}
              disabled={!appNoInput.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] transition-all"
              style={{
                background: appNoInput.trim() && !loading ? "#2f80ed" : "#252525",
                color:      appNoInput.trim() && !loading ? "#fff"    : "#4b5563",
              }}>
              {loading ? "조회 중..." : <><SearchIcon /><span>조회하기</span></>}
            </button>
          </div>
        )}

        {/* 이름+전화번호 탭 */}
        {tab === "contact" && (
          <div className="flex flex-col gap-3">
            <p className="text-[12px] font-semibold" style={{ color: "#6b7280" }}>
              신청 시 입력한 이름과 전화번호로 조회합니다
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="이름"
              className={inputClass}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
              onBlur={(e) => (e.target.style.borderColor = "#383838")}
            />
            <input
              type="tel"
              inputMode="numeric"
              value={phoneInput}
              onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && searchByContact()}
              placeholder="010-0000-0000"
              className={inputClass}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2f80ed")}
              onBlur={(e) => (e.target.style.borderColor = "#383838")}
            />
            <button
              onClick={searchByContact}
              disabled={!nameInput.trim() || phoneInput.length < 12 || loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] transition-all"
              style={{
                background: nameInput.trim() && phoneInput.length >= 12 && !loading ? "#2f80ed" : "#252525",
                color:      nameInput.trim() && phoneInput.length >= 12 && !loading ? "#fff"    : "#4b5563",
              }}>
              {loading ? "조회 중..." : <><SearchIcon /><span>조회하기</span></>}
            </button>
          </div>
        )}

        {/* 결과 */}
        {searched && (
          <div className="flex flex-col gap-3">
            {results.length > 0 ? (
              <>
                <p className="text-[12px]" style={{ color: "#4b5563" }}>
                  {results.length}건의 신청 내역을 찾았습니다.
                </p>
                {results.map((app) => (
                  <ResultCard key={app.id} app={app} />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 rounded-2xl gap-3"
                style={{ background: "#252525", border: "1px solid #2f2f2f" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#3a3a3a" strokeWidth="1.5" />
                  <path d="M16.5 16.5L21 21" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M9 9l4 4M13 9l-4 4" stroke="#3a3a3a" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="text-center">
                  <p className="text-[14px] font-medium" style={{ color: "#383838" }}>
                    신청 내역을 찾을 수 없습니다.
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: "#2a2a2a" }}>
                    입력하신 정보를 다시 확인해 주세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 첫 화면 안내 */}
        {!searched && !loading && (
          <div className="rounded-2xl p-4" style={{ background: "#252525", border: "1px solid #2f2f2f" }}>
            <div className="flex items-center gap-2 mb-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#2f80ed" strokeWidth="1.6" />
                <path d="M12 11v5" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="7.5" r="0.8" fill="#2f80ed" />
              </svg>
              <span className="text-[11px] font-semibold" style={{ color: "#2f80ed" }}>조회 안내</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {[
                "신청 완료 시 발급된 신청번호로 상태를 확인할 수 있습니다.",
                "신청번호를 분실한 경우 이름 + 전화번호 탭을 이용하세요.",
                "동일 번호로 여러 건 신청한 경우 전체 내역이 표시됩니다.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed" style={{ color: "#6b7280" }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#3a3a3a" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/" className="text-center text-[12.5px] font-medium py-2 transition-opacity active:opacity-70"
          style={{ color: "#3a3a3a" }}>
          트레이너 둘러보기 →
        </Link>
      </div>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense>
      <LookupContent />
    </Suspense>
  );
}

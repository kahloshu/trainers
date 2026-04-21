"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import {
  getTrainerById,
  updateTrainer,
  BRANCHES,
  type Trainer,
} from "@/app/data/trainers";
import GalleryManager, { type GalleryManagerRef } from "../../components/GalleryManager";

/* ── 이미지 압축 ── */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ── 아이콘 ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M11 6L5 12L11 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* ── 라벨 ── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold mb-1.5 tracking-wide" style={{ color: "var(--dash-text-muted)" }}>{children}</label>;
}

/* ── 입력 ── */
function Input({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="dash-input w-full px-4 py-3 text-[13.5px]"
    />
  );
}

/* ── 텍스트 에어리어 ── */
function Textarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="dash-input w-full px-4 py-3 text-[13.5px] resize-none leading-relaxed"
    />
  );
}

/* ── 섹션 카드 ── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dash-card-el rounded-2xl overflow-hidden" style={{ background: "var(--dash-card)" }}>
      <div className="px-5 pt-5 pb-2">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--dash-text-dimmed)" }}>{title}</p>
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

/* ── 로딩 스켈레톤 ── */
function Skeleton() {
  return (
    <div className="p-6 animate-pulse flex flex-col gap-4">
      <div className="h-8 w-48 rounded-xl" style={{ background: "var(--dash-card)" }} />
      {[1,2,3].map((i) => <div key={i} className="h-52 rounded-2xl" style={{ background: "var(--dash-card)" }} />)}
    </div>
  );
}

/* ── 페이지 ── */
export default function DashboardTrainerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router  = useRouter();

  const [trainer, setTrainer]           = useState<Trainer | null | "loading">("loading");
  const [name, setName]                 = useState("");
  const [specialty, setSpecialty]       = useState("");
  const [careerYears, setCareerYears]   = useState("1");
  const [shortBio, setShortBio]         = useState("");
  const [introduction, setIntroduction] = useState("");
  const [branch, setBranch]             = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [tags, setTags]                 = useState<string[]>([]);
  const [certInput, setCertInput]       = useState("");
  const [tagInput, setTagInput]         = useState("");
  const [kakaoId, setKakaoId]           = useState("");
  const [instagramId, setInstagramId]   = useState("");
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [error, setError]               = useState("");
  const fileRef    = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<GalleryManagerRef>(null);

  useEffect(() => {
    getTrainerById(id).then((found) => {
      if (!found) { setTrainer(null); return; }
      setTrainer(found);
      setName(found.name);
      setSpecialty(found.specialty);
      setCareerYears(String(found.careerYears));
      setShortBio(found.shortBio);
      setIntroduction(found.introduction);
      setBranch(found.branch ?? "");
      setProfileImage(found.profileImage);
      setKakaoId(found.kakaoId ?? "");
      setInstagramId(found.instagramId ?? "");
      setCertifications([...found.certifications]);
      setTags([...found.tags]);
    });
  }, [id]);

  if (trainer === "loading") return <Skeleton />;
  if (trainer === null) notFound();

  /* ── 사진 선택 ── */
  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setProfileImage(compressed);
  }

  /* ── 경력 추가 ── */
  function addCert() {
    const v = certInput.trim();
    if (!v || certifications.includes(v)) return;
    setCertifications((prev) => [...prev, v]);
    setCertInput("");
  }

  /* ── 태그 추가 ── */
  function addTag() {
    const v = tagInput.trim();
    if (!v || tags.includes(v)) return;
    setTags((prev) => [...prev, v]);
    setTagInput("");
  }

  /* ── 저장 ── */
  async function handleSave() {
    if (!trainer || trainer === "loading") return;
    if (!name.trim()) { setError("이름을 입력하세요."); return; }
    if (!specialty.trim()) { setError("전문 분야를 입력하세요."); return; }
    setError("");
    setSaving(true);
    const galleryImages = galleryRef.current
      ? await galleryRef.current.save(id)
      : trainer.galleryImages;
    const ok = await updateTrainer({
      ...trainer,
      name:          name.trim(),
      specialty:     specialty.trim(),
      careerYears:   Number(careerYears) || 1,
      shortBio:      shortBio.trim(),
      introduction:  introduction.trim(),
      branch,
      profileImage,
      kakaoId,
      instagramId,
      certifications,
      tags,
      galleryImages,
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  }

  return (
    <div className="p-6 max-w-[900px]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/dashboard/trainers")}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ background: "var(--dash-surface)", color: "var(--dash-text-sub)", border: "1px solid var(--dash-border)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-sub)")}
        >
          <BackIcon />
        </button>
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: "var(--dash-text)" }}>트레이너 수정</h2>
          <p className="text-[12px]" style={{ color: "var(--dash-text-dimmed)" }}>{trainer.name}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {error && <p className="text-[12.5px]" style={{ color: "#f87171" }}>{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-[13.5px] font-bold transition-all disabled:opacity-50"
            style={{
              background: saved ? "#34d399" : "linear-gradient(135deg,#2F6BFF,#1a55d4)",
              color: saved ? "#fff" : "#000",
            }}
          >
            {saving ? "저장 중…" : saved ? "저장됨 ✓" : "저장"}
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* ── 왼쪽 ── */}
        <div className="flex flex-col gap-4">

          {/* 기본 정보 */}
          <Card title="기본 정보">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>이름 *</Label>
                  <Input value={name} onChange={setName} placeholder="홍길동" />
                </div>
                <div>
                  <Label>경력 연수 *</Label>
                  <Input value={careerYears} onChange={setCareerYears} type="number" placeholder="3" />
                </div>
              </div>
              <div>
                <Label>전문 분야 *</Label>
                <Input value={specialty} onChange={setSpecialty} placeholder="근력 향상, 다이어트…" />
              </div>
              <div>
                <Label>지점</Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBranch("")}
                    className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                    style={{
                      background: branch === "" ? "rgba(47,107,255,0.12)" : "var(--dash-surface)",
                      color:      branch === "" ? "#2F6BFF" : "var(--dash-text-muted)",
                      border:     `1px solid ${branch === "" ? "rgba(47,107,255,0.25)" : "var(--dash-border)"}`,
                    }}
                  >
                    미배정
                  </button>
                  {BRANCHES.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBranch(b)}
                      className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                      style={{
                        background: branch === b ? "rgba(47,107,255,0.12)" : "var(--dash-surface)",
                        color:      branch === b ? "#2F6BFF" : "var(--dash-text-muted)",
                        border:     `1px solid ${branch === b ? "rgba(47,107,255,0.25)" : "var(--dash-border)"}`,
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>카카오톡</Label>
                  <Input value={kakaoId} onChange={setKakaoId} placeholder="오픈채팅 URL 또는 ID" />
                </div>
                <div>
                  <Label>인스타그램</Label>
                  <Input value={instagramId} onChange={setInstagramId} placeholder="@아이디 또는 URL" />
                </div>
              </div>
              <div>
                <Label>한줄 소개</Label>
                <Input value={shortBio} onChange={setShortBio} placeholder="트레이너를 한 줄로 소개하세요." />
              </div>
              <div>
                <Label>상세 소개</Label>
                <Textarea value={introduction} onChange={setIntroduction} rows={5}
                  placeholder="트레이너 상세 소개글을 입력하세요." />
              </div>
            </div>
          </Card>

          {/* 경력 및 자격 */}
          <Card title="경력 및 자격">
            <div className="flex gap-2 mb-3">
              <input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCert()}
                placeholder="예: NSCA-CPT 자격증 보유"
                className="dash-input flex-1 px-4 py-2.5 text-[13px]"
              />
              <button
                onClick={addCert}
                className="px-3.5 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}
              >
                <PlusIcon />
              </button>
            </div>
            {certifications.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: "var(--dash-text-faint)" }}>경력·자격 항목이 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {certifications.map((c, i) => (
                  <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                    style={{ background: "var(--dash-surface)" }}>
                    <span className="text-[13px]" style={{ color: "var(--dash-text-body)" }}>{c}</span>
                    <button onClick={() => setCertifications((prev) => prev.filter((_, j) => j !== i))}
                      style={{ color: "var(--dash-text-dimmed)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-dimmed)")}
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 갤러리 사진 */}
          <Card title="갤러리 사진">
            <GalleryManager
              ref={galleryRef}
              initialUrls={trainer.galleryImages}
            />
          </Card>

          {/* 전문 분야 태그 */}
          <Card title="전문 분야 태그">
            <div className="flex gap-2 mb-3">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                placeholder="예: 다이어트, 체형 교정…"
                className="dash-input flex-1 px-4 py-2.5 text-[13px]"
              />
              <button
                onClick={addTag}
                className="px-3.5 py-2.5 rounded-xl text-[13px] font-semibold"
                style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}
              >
                <PlusIcon />
              </button>
            </div>
            {tags.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: "var(--dash-text-faint)" }}>등록된 태그가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium"
                    style={{ background: "rgba(47,107,255,0.08)", color: "#2F6BFF", border: "1px solid rgba(47,107,255,0.15)" }}>
                    {tag}
                    <button onClick={() => setTags((prev) => prev.filter((_, j) => j !== i))}
                      style={{ color: "#2F6BFF", opacity: 0.6 }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.6")}
                    >
                      <XIcon />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── 오른쪽 ── */}
        <div className="flex flex-col gap-4">

          {/* 프로필 사진 */}
          <Card title="프로필 사진">
            <div
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
              style={{ aspectRatio: "1/1", background: "var(--dash-input-bg)", border: "1.5px dashed var(--dash-modal-border)" }}
              onClick={() => fileRef.current?.click()}
            >
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "var(--dash-text-dimmed)" }}>
                  <CameraIcon />
                  <p className="text-[12px]">클릭하여 사진 선택</p>
                </div>
              )}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                <div style={{ color: "#ffffff" }}><CameraIcon /></div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            {profileImage && (
              <button
                onClick={() => setProfileImage("")}
                className="w-full mt-2 py-2 rounded-xl text-[12px] font-medium transition-colors"
                style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-muted)")}
              >
                사진 제거
              </button>
            )}
            <p className="text-[11px] mt-2" style={{ color: "var(--dash-text-faint)" }}>최대 600px · JPEG 자동 압축</p>
          </Card>

          {/* 현재 통계 */}
          <Card title="현재 통계">
            <div className="flex flex-col gap-3">
              {[
                { label: "평균 평점", value: `${trainer.ratingAvg.toFixed(1)} / 5.0`, color: "#c9a96e" },
                { label: "후기 수",   value: `${trainer.reviewCount}건`,              color: "#2F6BFF" },
                { label: "경력",      value: `${trainer.careerYears}년차`,            color: "#34d399" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2.5"
                  style={{ borderBottom: "1px solid var(--dash-border-xs)" }}>
                  <span className="text-[12.5px]" style={{ color: "var(--dash-text-muted)" }}>{label}</span>
                  <span className="text-[14px] font-semibold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

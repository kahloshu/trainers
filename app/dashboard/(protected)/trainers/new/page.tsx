"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addTrainer, BRANCHES } from "@/app/data/trainers";
import { getCategories, type Category } from "@/app/data/categories";
import GalleryManager, { type GalleryManagerRef } from "../../components/GalleryManager";

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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[12px] font-semibold mb-1.5 tracking-wide" style={{ color: "var(--dash-text-muted)" }}>{children}</label>;
}
function Input({ value, onChange, placeholder, type = "text" }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="dash-input w-full px-4 py-3 text-[13.5px]" />
  );
}
function Textarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="dash-input w-full px-4 py-3 text-[13.5px] resize-none leading-relaxed" />
  );
}
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

export default function DashboardTrainerNewPage() {
  const router = useRouter();
  const [name, setName]                 = useState("");
  const [specialty, setSpecialty]       = useState("");
  const [careerYears, setCareerYears]   = useState("1");
  const [shortBio, setShortBio]         = useState("");
  const [introduction, setIntroduction] = useState("");
  const [branch, setBranch]             = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [career, setCareer]             = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [tags, setTags]                 = useState<string[]>([]);
  const [careerInput, setCareerInput]   = useState("");
  const [certInput, setCertInput]       = useState("");
  const [categories, setCategories]     = useState<Category[]>([]);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const fileRef    = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<GalleryManagerRef>(null);

  useEffect(() => { getCategories().then(setCategories); }, []);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(await compressImage(file));
  }

  function addCareer() {
    const v = careerInput.trim();
    if (!v || career.includes(v)) return;
    setCareer((p) => [...p, v]); setCareerInput("");
  }
  function addCert() {
    const v = certInput.trim();
    if (!v || certifications.includes(v)) return;
    setCertifications((p) => [...p, v]); setCertInput("");
  }
  function toggleTag(id: string) {
    setTags((p) => p.includes(id) ? p.filter((t) => t !== id) : [...p, id]);
  }

  async function handleSubmit() {
    if (!name.trim())      { setError("이름을 입력하세요."); return; }
    if (!specialty.trim()) { setError("전문 분야를 입력하세요."); return; }
    setError(""); setSaving(true);
    const newId = `t-${Date.now()}`;
    const galleryImages = galleryRef.current
      ? await galleryRef.current.save(newId)
      : [];
    await addTrainer({
      id: newId,
      name: name.trim(), specialty: specialty.trim(),
      careerYears: Number(careerYears) || 1,
      shortBio: shortBio.trim(), introduction: introduction.trim(),
      branch, profileImage, career, certifications, tags,
      galleryImages,
      isActive: true, featured: false, displayOrder: 0,
    });
    setSaving(false);
    router.push("/dashboard/trainers");
  }

  return (
    <div className="p-6 max-w-[900px]">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/dashboard/trainers")}
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ background: "var(--dash-surface)", color: "var(--dash-text-sub)", border: "1px solid var(--dash-border)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-sub)")}
        >
          <BackIcon />
        </button>
        <h2 className="text-[18px] font-bold" style={{ color: "var(--dash-text)" }}>새 트레이너 등록</h2>
        <div className="ml-auto flex items-center gap-2">
          {error && <p className="text-[12.5px]" style={{ color: "#f87171" }}>{error}</p>}
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-[13.5px] font-bold disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#2F6BFF,#1a55d4)", color: "#fff" }}>
            {saving ? "등록 중…" : "등록"}
          </button>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
        <div className="flex flex-col gap-4">
          <Card title="기본 정보">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>이름 *</Label><Input value={name} onChange={setName} placeholder="홍길동" /></div>
                <div><Label>경력 연수 *</Label><Input value={careerYears} onChange={setCareerYears} type="number" placeholder="3" /></div>
              </div>
              <div>
                <Label>전문 분야 *</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setSpecialty(cat.id === specialty ? "" : cat.id)}
                      className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                      style={{
                        background: specialty === cat.id ? "rgba(47,107,255,0.12)" : "var(--dash-surface)",
                        color:      specialty === cat.id ? "#2F6BFF" : "var(--dash-text-muted)",
                        border:     `1px solid ${specialty === cat.id ? "rgba(47,107,255,0.25)" : "var(--dash-border)"}`,
                      }}>
                      {cat.label}
                    </button>
                  ))}
                  {categories.length === 0 && <p className="text-[12.5px]" style={{ color: "var(--dash-text-faint)" }}>카테고리 로딩 중…</p>}
                </div>
              </div>
              <div>
                <Label>지점</Label>
                <div className="flex flex-wrap gap-2">
                  {["", ...BRANCHES].map((b) => (
                    <button key={b || "none"} onClick={() => setBranch(b)}
                      className="px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                      style={{
                        background: branch === b ? "rgba(47,107,255,0.12)" : "var(--dash-surface)",
                        color:      branch === b ? "#2F6BFF" : "var(--dash-text-muted)",
                        border:     `1px solid ${branch === b ? "rgba(47,107,255,0.25)" : "var(--dash-border)"}`,
                      }}>
                      {b || "미배정"}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>한줄 소개</Label><Input value={shortBio} onChange={setShortBio} placeholder="트레이너를 한 줄로 소개하세요." /></div>
              <div><Label>상세 소개</Label><Textarea value={introduction} onChange={setIntroduction} rows={5} placeholder="트레이너 상세 소개글을 입력하세요." /></div>
            </div>
          </Card>

          <Card title="경력">
            <div className="flex gap-2 mb-3">
              <input value={careerInput} onChange={(e) => setCareerInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCareer()} placeholder="예: 前 국가대표 트레이닝 코치"
                className="dash-input flex-1 px-4 py-2.5 text-[13px]" />
              <button onClick={addCareer} className="px-3.5 py-2.5 rounded-xl"
                style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}><PlusIcon /></button>
            </div>
            {career.length === 0
              ? <p className="text-[12.5px]" style={{ color: "var(--dash-text-faint)" }}>경력 항목이 없습니다.</p>
              : <div className="flex flex-col gap-2">
                  {career.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                      style={{ background: "var(--dash-surface)" }}>
                      <span className="text-[13px]" style={{ color: "var(--dash-text-body)" }}>{c}</span>
                      <button onClick={() => setCareer((p) => p.filter((_, j) => j !== i))} style={{ color: "var(--dash-text-dimmed)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-dimmed)")}>
                        <XIcon />
                      </button>
                    </div>
                  ))}
                </div>}
          </Card>

          <Card title="자격증">
            <div className="flex gap-2 mb-3">
              <input value={certInput} onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCert()} placeholder="예: NSCA-CPT 자격증 보유"
                className="dash-input flex-1 px-4 py-2.5 text-[13px]" />
              <button onClick={addCert} className="px-3.5 py-2.5 rounded-xl"
                style={{ background: "rgba(47,107,255,0.12)", color: "#2F6BFF" }}><PlusIcon /></button>
            </div>
            {certifications.length === 0
              ? <p className="text-[12.5px]" style={{ color: "var(--dash-text-faint)" }}>자격증 항목이 없습니다.</p>
              : <div className="flex flex-col gap-2">
                  {certifications.map((c, i) => (
                    <div key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                      style={{ background: "var(--dash-surface)" }}>
                      <span className="text-[13px]" style={{ color: "var(--dash-text-body)" }}>{c}</span>
                      <button onClick={() => setCertifications((p) => p.filter((_, j) => j !== i))} style={{ color: "var(--dash-text-dimmed)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dash-text-dimmed)")}>
                        <XIcon />
                      </button>
                    </div>
                  ))}
                </div>}
          </Card>

          <Card title="갤러리 사진">
            <GalleryManager ref={galleryRef} initialUrls={[]} />
          </Card>

          <Card title="전문 분야 태그">
            <p className="text-[12px] mb-3" style={{ color: "var(--dash-text-dimmed)" }}>복수 선택 가능합니다.</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = tags.includes(cat.id);
                return (
                  <button key={cat.id} type="button" onClick={() => toggleTag(cat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                    style={{
                      background: active ? "rgba(47,107,255,0.08)" : "var(--dash-surface)",
                      color:      active ? "#2F6BFF" : "var(--dash-text-muted)",
                      border:     `1px solid ${active ? "rgba(47,107,255,0.25)" : "var(--dash-border)"}`,
                    }}>
                    {active && <span style={{ fontSize: 10 }}>✓</span>}
                    {cat.label}
                  </button>
                );
              })}
              {categories.length === 0 && <p className="text-[12.5px]" style={{ color: "var(--dash-text-faint)" }}>카테고리 로딩 중…</p>}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="프로필 사진">
            <div className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
              style={{ aspectRatio: "1/1", background: "var(--dash-input-bg)", border: "1.5px dashed var(--dash-modal-border)" }}
              onClick={() => fileRef.current?.click()}>
              {profileImage
                ? <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: "var(--dash-text-dimmed)" }}>
                    <CameraIcon />
                    <p className="text-[12px]">클릭하여 사진 선택</p>
                  </div>}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.55)" }}>
                <div style={{ color: "#ffffff" }}><CameraIcon /></div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <p className="text-[11px] mt-2" style={{ color: "var(--dash-text-faint)" }}>최대 600px · JPEG 자동 압축</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

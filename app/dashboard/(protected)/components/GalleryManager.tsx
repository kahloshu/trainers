"use client";

import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { uploadGalleryImage, deleteGalleryImages } from "@/app/data/trainers";

/* ── 타입 ── */
type GalleryItem =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File; preview: string };

export interface GalleryManagerRef {
  /** 업로드 실행 후 최종 URL 배열 반환 */
  save: (trainerId: string) => Promise<string[]>;
}

interface Props {
  initialUrls?: string[];
  disabled?: boolean;
}

/* ── 이미지 압축 (Blob 반환) ── */
async function compressToBlob(file: File, maxPx = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
          else { width = Math.round((width * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("압축 실패"))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_ITEMS = 10;

/* ── 컴포넌트 ── */
const GalleryManager = forwardRef<GalleryManagerRef, Props>(
  function GalleryManager({ initialUrls = [], disabled = false }, ref) {
    const [items, setItems]           = useState<GalleryItem[]>(
      initialUrls.map((url) => ({ kind: "existing", url }))
    );
    const [removedUrls, setRemovedUrls] = useState<string[]>([]);
    const [dragFrom, setDragFrom]     = useState<number | null>(null);
    const [uploading, setUploading]   = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── 저장 로직 (부모에서 호출) ── */
    useImperativeHandle(ref, () => ({
      async save(trainerId: string): Promise<string[]> {
        setUploading(true);

        // 삭제된 기존 이미지 Storage에서 제거
        if (removedUrls.length > 0) {
          await deleteGalleryImages(removedUrls);
        }

        // 새 파일 압축 → 업로드
        const finalUrls: (string | null)[] = await Promise.all(
          items.map(async (item) => {
            if (item.kind === "existing") return item.url;
            const blob = await compressToBlob(item.file);
            const ext  = item.file.name.split(".").pop()?.toLowerCase() || "jpg";
            return uploadGalleryImage(trainerId, blob, ext);
          })
        );

        setUploading(false);
        return finalUrls.filter((u): u is string => u !== null);
      },
    }));

    /* ── 파일 선택 ── */
    function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const remaining = MAX_ITEMS - items.length;
      const toAdd = files.slice(0, remaining).map<GalleryItem>((file) => ({
        kind: "new",
        file,
        preview: URL.createObjectURL(file),
      }));
      setItems((prev) => [...prev, ...toAdd]);
      e.target.value = "";
    }

    /* ── 아이템 삭제 ── */
    function removeItem(idx: number) {
      const item = items[idx];
      if (item.kind === "existing") {
        setRemovedUrls((prev) => [...prev, item.url]);
      } else {
        URL.revokeObjectURL(item.preview);
      }
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }

    /* ── 드래그 리오더 ── */
    function handleDrop(toIdx: number) {
      if (dragFrom === null || dragFrom === toIdx) { setDragFrom(null); return; }
      setItems((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragFrom, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });
      setDragFrom(null);
    }

    return (
      <div>
        {uploading && (
          <div className="flex items-center gap-2 mb-3 text-[12.5px]" style={{ color: "#2F6BFF" }}>
            <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="30 56" />
            </svg>
            업로드 중…
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {items.map((item, i) => {
            const src = item.kind === "existing" ? item.url : item.preview;
            return (
              <div
                key={i}
                draggable={!disabled}
                onDragStart={() => setDragFrom(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => setDragFrom(null)}
                className="relative rounded-xl overflow-hidden"
                style={{
                  aspectRatio: "1/1",
                  border: dragFrom === i
                    ? "2px solid #2F6BFF"
                    : "1px solid var(--dash-hover-btn)",
                  opacity: dragFrom === i ? 0.45 : 1,
                  cursor: disabled ? "default" : "grab",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`갤러리 ${i + 1}`} className="w-full h-full object-cover" />

                {/* 순서 번호 */}
                <div
                  className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "rgba(0,0,0,0.65)", color: "#fff" }}
                >
                  {i + 1}
                </div>

                {/* 삭제 버튼 */}
                {!disabled && (
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
                    style={{ background: "rgba(248,113,113,0.92)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}

                {/* 드래그 핸들 힌트 */}
                {!disabled && (
                  <div
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5"
                    style={{ pointerEvents: "none" }}
                  >
                    {[0,1,2].map((d) => (
                      <div key={d} className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.45)" }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* 추가 버튼 */}
          {!disabled && items.length < MAX_ITEMS && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all"
              style={{
                aspectRatio: "1/1",
                background: "var(--dash-input-bg)",
                border: "1.5px dashed var(--dash-modal-border)",
                color: "var(--dash-text-dimmed)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(47,107,255,0.4)";
                (e.currentTarget as HTMLElement).style.color = "#2F6BFF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-modal-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--dash-text-dimmed)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[11px] font-medium">사진 추가</span>
            </button>
          )}
        </div>

        {/* 빈 상태 */}
        {items.length === 0 && disabled && (
          <p className="text-[12.5px] text-center py-6" style={{ color: "var(--dash-text-faint)" }}>
            등록된 갤러리 사진이 없습니다.
          </p>
        )}

        {!disabled && (
          <p className="text-[11px] mt-2.5" style={{ color: "var(--dash-text-faint)" }}>
            최대 {MAX_ITEMS}장 · 드래그로 순서 변경 · 최대 1200px JPEG 자동 압축
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>
    );
  }
);

export default GalleryManager;

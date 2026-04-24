"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function GallerySlider({ images }: { images: string[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [imgW, setImgW]               = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const dragStart  = useRef<{ x: number; scrollLeft: number } | null>(null);
  const didDrag    = useRef(false);

  // 컨테이너 실제 너비로 이미지 크기 계산
  useEffect(() => {
    function measure() {
      if (!wrapperRef.current) return;
      const w = wrapperRef.current.offsetWidth;
      setImgW(Math.floor((w - 16 - 8 * 2) / 2.5));
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ESC / 화살표 키
  useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     setLightboxIdx(null);
      if (e.key === "ArrowLeft")  setLightboxIdx((p) => (p !== null ? Math.max(0, p - 1) : p));
      if (e.key === "ArrowRight") setLightboxIdx((p) => (p !== null ? Math.min(images.length - 1, p + 1) : p));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, images.length]);

  // 마우스 드래그
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, scrollLeft: scrollRef.current?.scrollLeft ?? 0 };
    didDrag.current = false;
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current || !scrollRef.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 4) didDrag.current = true;
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
  }, []);
  const onMouseUp = useCallback(() => { dragStart.current = null; }, []);

  if (images.length === 0) return null;

  const isSmall = images.length <= 2;

  return (
    <>
      {/* ── 갤러리 트랙 ── */}
      <div ref={wrapperRef} className="mt-4 mb-1">
        <h2
          className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3 px-4"
          style={{ color: "#2f80ed" }}
        >
          갤러리
        </h2>

        {/* 1~2장: 그리드, 3장+: 스크롤 슬라이더 */}
        {isSmall ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: images.length === 1 ? "1fr" : "1fr 1fr",
              gap: "8px",
              padding: "0 16px",
            }}
          >
            {images.map((url, i) => (
              <div
                key={i}
                onClick={() => setLightboxIdx(i)}
                style={{
                  ...(images.length === 1 ? { maxHeight: "280px" } : { aspectRatio: "1" }),
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`갤러리 ${i + 1}`}
                  draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ paddingLeft: "16px" }}>
            <div
              ref={scrollRef}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                overflowX: "scroll",
                WebkitOverflowScrolling: "touch",
                scrollSnapType: "x mandatory",
                gap: "8px",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
                cursor: "grab",
                userSelect: "none",
              } as React.CSSProperties}
            >
              {imgW > 0 && images.map((url, i) => (
                <div
                  key={i}
                  onClick={() => { if (!didDrag.current) setLightboxIdx(i); }}
                  style={{
                    flex: `0 0 ${imgW}px`,
                    width: `${imgW}px`,
                    height: `${imgW}px`,
                    borderRadius: "12px",
                    overflow: "hidden",
                    scrollSnapAlign: "start",
                    cursor: "pointer",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`갤러리 ${i + 1}`}
                    draggable={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                  />
                </div>
              ))}
              <div style={{ flexShrink: 0, width: "8px" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── 라이트박스 ── */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
          }}
        >
          {/* 카운터 */}
          <div style={{
            position: "absolute", top: "18px", left: "50%", transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.55)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.05em",
          }}>
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* 닫기 */}
          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: "absolute", top: "14px", right: "14px",
              width: "38px", height: "38px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff", cursor: "pointer", fontSize: "18px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* 이전 */}
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
              style={{
                position: "absolute", left: "12px",
                width: "44px", height: "44px", borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", cursor: "pointer", fontSize: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ‹
            </button>
          )}

          {/* 다음 */}
          {lightboxIdx < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
              style={{
                position: "absolute", right: "12px",
                width: "44px", height: "44px", borderRadius: "50%",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", cursor: "pointer", fontSize: "24px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ›
            </button>
          )}

          {/* 이미지 */}
          <div
            onClick={() => setLightboxIdx(null)}
            style={{ borderRadius: "16px", overflow: "hidden", maxWidth: "90vw", maxHeight: "80vh" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIdx]}
              alt={`갤러리 ${lightboxIdx + 1}`}
              style={{ display: "block", maxWidth: "90vw", maxHeight: "80vh", objectFit: "contain" }}
            />
          </div>

          {/* 하단 점 인디케이터 */}
          {images.length > 1 && (
            <div style={{ position: "absolute", bottom: "24px", display: "flex", gap: "6px" }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                  style={{
                    width: i === lightboxIdx ? "20px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === lightboxIdx ? "#fff" : "rgba(255,255,255,0.3)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

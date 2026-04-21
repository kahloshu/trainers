"use client";

import { useState, useMemo, useEffect } from "react";
import { getAllTrainers, shuffleTrainers } from "@/app/data/trainers";
import type { Trainer } from "@/app/data/trainers";
import TrainerCard from "@/app/components/TrainerCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import BottomNav from "@/app/components/BottomNav";

function SearchIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="#5a5a5a" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="#5a5a5a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function TrainerListPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [shuffled, setShuffled] = useState<Trainer[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getAllTrainers().then((trainers) => setShuffled(shuffleTrainers(trainers)));
  }, []);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  const filtered = useMemo(() => {
    let list = selectedCategory === "all" ? shuffled : shuffled.filter((t: Trainer) => t.tags.includes(selectedCategory));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t: Trainer) =>
        t.name.toLowerCase().includes(q) ||
        (t.specialty ?? "").toLowerCase().includes(q) ||
        (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, shuffled, searchQuery]);

  return (
    <div className="min-h-dvh" style={{ background: "#0e0e0e" }}>

      {/* ── 헤더 ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(14,14,14,0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {searchOpen ? (
          <div className="flex items-center gap-2 px-4 pt-5 pb-3">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
              style={{ background: "#1a1a1a", border: "1.5px solid rgba(47,107,255,0.35)" }}>
              <SearchIcon />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                placeholder="이름, 전문 분야, 태그 검색"
                className="flex-1 bg-transparent outline-none text-[14px]"
                style={{ color: "#ffffff" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ color: "#5a5a5a" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            <button onClick={closeSearch} className="text-[13px] font-medium" style={{ color: "#2F6BFF" }}>
              취소
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase mb-1"
                  style={{ color: "#2F6BFF" }}>
                  James Gym
                </p>
                <h1 className="text-[24px] font-bold tracking-tight leading-none"
                  style={{ color: "#ffffff" }}>
                  트레이너
                </h1>
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ background: "#1a1a1a" }}
                aria-label="검색"
              >
                <SearchIcon />
              </button>
            </div>
            <p className="px-4 text-[13px] pb-3" style={{ color: "#5a5a5a" }}>
              나에게 맞는 트레이너를 찾아보세요.
            </p>
          </>
        )}

        <div className="pb-3">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </header>

      {/* ── 리스트 ── */}
      <main className="page-scroll">
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3 pt-3 pb-4">
            {filtered.map((trainer: Trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
            <div className="text-center pt-3 pb-6">
              <p className="text-[12px]" style={{ color: "#3a3a3a" }}>
                모든 트레이너를 확인했습니다.
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="mt-1.5 text-[12px] font-medium"
                style={{ color: "#2F6BFF" }}
              >
                전체 트레이너 다시 보기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-28 px-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(47,107,255,0.08)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  stroke="#2F6BFF" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" stroke="#2F6BFF" strokeWidth="1.8" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                  stroke="#2F6BFF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[15px] font-bold" style={{ color: "#ffffff" }}>
              {searchQuery ? "검색 결과가 없습니다." : "해당 분야의 트레이너가 없습니다."}
            </p>
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "#5a5a5a" }}>
              {searchQuery ? "다른 검색어를 입력해 보세요." : "다른 카테고리를 선택하거나\n전체 트레이너를 확인해 보세요."}
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="btn-primary mt-5 w-auto px-7"
              style={{ borderRadius: "12px" }}
            >
              전체 보기
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

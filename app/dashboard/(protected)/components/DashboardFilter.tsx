"use client";

import { useState, useCallback } from "react";

/* ── 타입 ── */
export interface FilterState {
  search: string;
  status: string;   // "" = 전체
  dateFrom: string; // "YYYY-MM-DD" | ""
  dateTo: string;
}

export const EMPTY_FILTER: FilterState = {
  search: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

interface FilterChip {
  value: string;
  label: string;
}

interface DashboardFilterProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  statusChips?: FilterChip[];
  searchPlaceholder?: string;
  showDateRange?: boolean;
}

/* ── 아이콘 ── */
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardFilter({
  value,
  onChange,
  statusChips = [],
  searchPlaceholder = "검색…",
  showDateRange = false,
}: DashboardFilterProps) {
  const [searchFocus, setSearchFocus] = useState(false);

  const set = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...value, ...patch }),
    [value, onChange]
  );

  const hasFilter =
    value.search !== "" ||
    value.status !== "" ||
    value.dateFrom !== "" ||
    value.dateTo !== "";

  return (
    <div className="flex flex-col gap-3">
      {/* 상단 행: 검색 + 날짜 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 검색 인풋 */}
        <div
          className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl flex-1 min-w-[200px] transition-all"
          style={{
            background: "#141414",
            border: `1.5px solid ${searchFocus ? "#8eabff" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          <span style={{ color: searchFocus ? "#8eabff" : "#3a3a3a", flexShrink: 0 }}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={value.search}
            onChange={(e) => set({ search: e.target.value })}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent outline-none text-[13.5px]"
            style={{ color: "#ffffff", minWidth: 0 }}
          />
          {value.search && (
            <button
              onClick={() => set({ search: "" })}
              className="flex-shrink-0"
              style={{ color: "#3a3a3a" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#3a3a3a")}
            >
              <ClearIcon />
            </button>
          )}
        </div>

        {/* 날짜 범위 */}
        {showDateRange && (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#141414", border: "1.5px solid rgba(255,255,255,0.06)" }}
            >
              <span style={{ color: "#3a3a3a" }}><CalendarIcon /></span>
              <input
                type="date"
                value={value.dateFrom}
                onChange={(e) => set({ dateFrom: e.target.value })}
                className="bg-transparent outline-none text-[13px]"
                style={{ color: value.dateFrom ? "#ffffff" : "#3a3a3a", colorScheme: "dark", width: 120 }}
              />
            </div>
            <span className="text-[12px]" style={{ color: "#3a3a3a" }}>~</span>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#141414", border: "1.5px solid rgba(255,255,255,0.06)" }}
            >
              <input
                type="date"
                value={value.dateTo}
                onChange={(e) => set({ dateTo: e.target.value })}
                className="bg-transparent outline-none text-[13px]"
                style={{ color: value.dateTo ? "#ffffff" : "#3a3a3a", colorScheme: "dark", width: 120 }}
              />
            </div>
          </div>
        )}

        {/* 전체 초기화 */}
        {hasFilter && (
          <button
            onClick={() => onChange(EMPTY_FILTER)}
            className="px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all"
            style={{
              background: "rgba(248,113,113,0.08)",
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.12)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.14)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)")}
          >
            초기화
          </button>
        )}
      </div>

      {/* 상태 칩 */}
      {statusChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {[{ value: "", label: "전체" }, ...statusChips].map((chip) => {
            const active = value.status === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => set({ status: chip.value })}
                className="px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all"
                style={{
                  background: active ? "rgba(142,171,255,0.12)" : "#141414",
                  color: active ? "#8eabff" : "#5a5a5a",
                  border: `1px solid ${active ? "rgba(142,171,255,0.25)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── 필터 적용 유틸 (각 페이지에서 재사용) ── */
export function applyFilter<T extends Record<string, unknown>>(
  items: T[],
  filter: FilterState,
  opts: {
    searchFields: (keyof T)[];
    statusField?: keyof T;
    dateField?: keyof T;  // ISO string
  }
): T[] {
  let result = items;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter((item) =>
      opts.searchFields.some((f) => String(item[f] ?? "").toLowerCase().includes(q))
    );
  }

  if (filter.status && opts.statusField) {
    result = result.filter((item) => item[opts.statusField!] === filter.status);
  }

  if (filter.dateFrom && opts.dateField) {
    const from = new Date(filter.dateFrom);
    result = result.filter((item) => new Date(String(item[opts.dateField!])) >= from);
  }

  if (filter.dateTo && opts.dateField) {
    const to = new Date(filter.dateTo + "T23:59:59");
    result = result.filter((item) => new Date(String(item[opts.dateField!])) <= to);
  }

  return result;
}

type Props = {
  page: number;
  total: number;
  onChange: (p: number) => void;
};

export default function Pagination({ page, total, onChange }: Props) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-[12.5px] disabled:opacity-30 transition-opacity"
        style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}>
        이전
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className="w-8 h-8 rounded-lg text-[12.5px] font-semibold transition-all"
          style={{
            background: p === page ? "rgba(47,107,255,0.15)" : "var(--dash-surface)",
            color: p === page ? "#2F6BFF" : "var(--dash-text-muted)",
          }}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === total}
        className="px-3 py-1.5 rounded-lg text-[12.5px] disabled:opacity-30 transition-opacity"
        style={{ background: "var(--dash-surface)", color: "var(--dash-text-muted)" }}>
        다음
      </button>
    </div>
  );
}

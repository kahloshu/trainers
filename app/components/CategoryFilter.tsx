"use client";

import { CATEGORIES } from "@/app/data/trainers";

type Props = {
  selected: string;
  onChange: (id: string) => void;
};

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-0.5">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`chip flex-shrink-0 ${selected === cat.id ? "active" : ""}`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

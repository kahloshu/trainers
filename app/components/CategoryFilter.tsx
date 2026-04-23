"use client";

import { useState, useEffect } from "react";
import { getCategories, type Category } from "@/app/data/categories";

type Props = {
  selected: string;
  onChange: (id: string) => void;
  categories?: Category[];
};

const ALL = { id: "all", label: "전체", displayOrder: -1 } satisfies Category;

export default function CategoryFilter({ selected, onChange, categories: propCategories }: Props) {
  const [fetched, setFetched] = useState<Category[]>([]);

  useEffect(() => {
    if (!propCategories) getCategories().then(setFetched);
  }, [propCategories]);

  const categories = propCategories ?? fetched;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-0.5">
      {[ALL, ...categories].map((cat) => (
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

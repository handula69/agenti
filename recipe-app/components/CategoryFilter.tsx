"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CATEGORIES, CategoryKey } from "@/lib/categories";

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  function setCategory(key: CategoryKey | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) params.set("category", key);
    else params.delete("category");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setCategory(null)}
        className={`text-sm rounded-full px-3 py-1 border ${
          !active ? "bg-brand-600 text-white border-brand-600" : "bg-white text-stone-600 border-stone-300"
        }`}
      >
        Vše
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => setCategory(c.key)}
          className={`text-sm rounded-full px-3 py-1 border ${
            active === c.key ? "bg-brand-600 text-white border-brand-600" : "bg-white text-stone-600 border-stone-300"
          }`}
        >
          {c.labelCz}
        </button>
      ))}
    </div>
  );
}

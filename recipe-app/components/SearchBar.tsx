"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Hledat recept podle názvu..."
        className="flex-1 rounded-lg border border-stone-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
      />
      <button type="submit" className="rounded-lg bg-stone-800 text-white px-4 py-2 text-sm">
        Hledat
      </button>
    </form>
  );
}

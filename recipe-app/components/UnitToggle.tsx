"use client";

export type DisplayMode = "cz" | "en";

export function UnitToggle({ mode, onChange }: { mode: DisplayMode; onChange: (mode: DisplayMode) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-stone-300 overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => onChange("cz")}
        className={`px-3 py-1.5 ${mode === "cz" ? "bg-brand-600 text-white" : "bg-white text-stone-600"}`}
      >
        🇨🇿 g
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`px-3 py-1.5 ${mode === "en" ? "bg-brand-600 text-white" : "bg-white text-stone-600"}`}
      >
        🇬🇧 cups
      </button>
    </div>
  );
}

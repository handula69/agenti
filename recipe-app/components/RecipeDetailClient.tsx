"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Recipe } from "@/lib/types";
import { UnitToggle, DisplayMode } from "./UnitToggle";
import { IngredientRow } from "./IngredientRow";

export function RecipeDetailClient({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [mode, setMode] = useState<DisplayMode>("cz");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "cz" ? recipe.title_cz : recipe.title_en;
  const steps = mode === "cz" ? recipe.steps_cz : recipe.steps_en;

  async function handleDelete() {
    if (!confirm("Opravdu smazat tento recept? Tuto akci nelze vrátit zpět.")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Smazání receptu selhalo.");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Smazání receptu selhalo.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {recipe.cover_image_url && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
          {recipe.source_image_urls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="h-40 w-auto rounded-lg object-cover border border-stone-200 shrink-0" />
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{title || "(bez názvu)"}</h1>
          <p className="text-sm text-stone-500 mt-1">
            {recipe.servings ? `${recipe.servings} porcí` : null}
            {recipe.prep_minutes ? ` · příprava ${recipe.prep_minutes} min` : null}
            {recipe.cook_minutes ? ` · vaření ${recipe.cook_minutes} min` : null}
          </p>
        </div>
        <UnitToggle mode={mode} onChange={setMode} />
      </div>

      <section>
        <h2 className="font-semibold text-stone-800 mb-2">Ingredience</h2>
        <ul>
          {recipe.ingredients.map((ing) => (
            <IngredientRow key={ing.id} ingredient={ing} mode={mode} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold text-stone-800 mb-2">Postup</h2>
        <ol className="space-y-2 list-decimal list-inside">
          {steps.map((step, i) => (
            <li key={i} className="text-stone-800">
              {step}
            </li>
          ))}
        </ol>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2 border-t border-stone-100">
        <Link href={`/recipes/${recipe.id}/edit`} className="text-sm text-brand-600 underline">
          Upravit
        </Link>
        <button type="button" onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 underline disabled:opacity-50">
          {deleting ? "Mažu..." : "Smazat"}
        </button>
      </div>
    </div>
  );
}

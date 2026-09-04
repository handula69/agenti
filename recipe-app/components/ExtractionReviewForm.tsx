"use client";

import { useState } from "react";
import { MetricUnit, UsUnit } from "@/lib/types";
import { convertToUs, formatUsUnit } from "@/lib/units";
import { PhotoUploader, PhotoItem } from "./PhotoUploader";

const METRIC_UNITS: MetricUnit[] = ["g", "ml", "ks", "lžíce", "lžička", "špetka"];
const US_UNITS: UsUnit[] = ["cup", "tbsp", "tsp", "oz", "ks", "pinch"];

export interface FormIngredient {
  name_cz: string;
  name_en: string;
  amount_metric: string; // string kvůli prázdné hodnotě v inputu
  unit_metric: MetricUnit;
  amount_us: string;
  unit_us: UsUnit | null;
  density_key: string | null;
  manual_override: boolean;
}

export interface FormState {
  title_cz: string;
  title_en: string;
  servings: string;
  prep_minutes: string;
  cook_minutes: string;
  steps_cz: string[];
  steps_en: string[];
  ingredients: FormIngredient[];
}

export function emptyIngredient(): FormIngredient {
  return {
    name_cz: "",
    name_en: "",
    amount_metric: "",
    unit_metric: "g",
    amount_us: "",
    unit_us: null,
    density_key: null,
    manual_override: false,
  };
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function buildRecipeInputFromForm(form: FormState) {
  return {
    title_cz: form.title_cz.trim(),
    title_en: form.title_en.trim(),
    servings: toNumberOrNull(form.servings),
    prep_minutes: toNumberOrNull(form.prep_minutes),
    cook_minutes: toNumberOrNull(form.cook_minutes),
    steps_cz: form.steps_cz.filter((s) => s.trim() !== ""),
    steps_en: form.steps_en.filter((s) => s.trim() !== ""),
    ingredients: form.ingredients
      .filter((ing) => ing.name_cz.trim() !== "" || ing.name_en.trim() !== "")
      .map((ing) => ({
        name_cz: ing.name_cz.trim(),
        name_en: ing.name_en.trim(),
        amount_metric: toNumberOrNull(ing.amount_metric),
        unit_metric: ing.unit_metric,
        amount_us: ing.manual_override ? toNumberOrNull(ing.amount_us) : null,
        unit_us: ing.manual_override ? ing.unit_us : null,
        density_key: ing.density_key,
        manual_override: ing.manual_override,
      })),
  };
}

function IngredientEditor({
  ingredient,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  ingredient: FormIngredient;
  onChange: (next: FormIngredient) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const preview = convertToUs(
    toNumberOrNull(ingredient.amount_metric),
    ingredient.unit_metric,
    ingredient.name_cz,
    ingredient.name_en,
    ingredient.density_key
  );

  return (
    <div className="border border-stone-200 rounded-lg p-3 space-y-2 bg-white">
      <div className="grid grid-cols-2 gap-2">
        <input
          value={ingredient.name_cz}
          onChange={(e) => onChange({ ...ingredient, name_cz: e.target.value })}
          placeholder="Ingredience (CZ)"
          className="rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
        <input
          value={ingredient.name_en}
          onChange={(e) => onChange({ ...ingredient, name_en: e.target.value })}
          placeholder="Ingredient (EN)"
          className="rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={ingredient.amount_metric}
          onChange={(e) => onChange({ ...ingredient, amount_metric: e.target.value })}
          placeholder="množství"
          inputMode="decimal"
          className="w-24 rounded border border-stone-300 px-2 py-1.5 text-sm"
        />
        <select
          value={ingredient.unit_metric}
          onChange={(e) => onChange({ ...ingredient, unit_metric: e.target.value as MetricUnit })}
          className="rounded border border-stone-300 px-2 py-1.5 text-sm"
        >
          {METRIC_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <span className="text-stone-400">→</span>

        {!ingredient.manual_override ? (
          <>
            <span className="text-sm text-stone-600">
              {preview.amount !== null ? formatUsUnit(preview.unit, preview.amount) : "-"}
              {preview.approx && <span className="text-amber-600"> (≈ přibližně)</span>}
              {preview.amount !== null && !preview.matched && (
                <span className="text-amber-600"> - neznámá surovina, orientačně</span>
              )}
            </span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...ingredient,
                  manual_override: true,
                  amount_us: preview.amount !== null ? String(preview.amount) : "",
                  unit_us: preview.unit,
                })
              }
              className="text-xs text-brand-600 underline"
            >
              upravit ručně
            </button>
          </>
        ) : (
          <>
            <input
              value={ingredient.amount_us}
              onChange={(e) => onChange({ ...ingredient, amount_us: e.target.value })}
              placeholder="množství"
              inputMode="decimal"
              className="w-24 rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
            <select
              value={ingredient.unit_us ?? "cup"}
              onChange={(e) => onChange({ ...ingredient, unit_us: e.target.value as UsUnit })}
              className="rounded border border-stone-300 px-2 py-1.5 text-sm"
            >
              {US_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange({ ...ingredient, manual_override: false })}
              className="text-xs text-stone-500 underline"
            >
              zpět na automatický převod
            </button>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 text-xs text-stone-400">
        <button type="button" onClick={() => onMove(-1)} disabled={isFirst} className="disabled:opacity-30">
          ↑
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={isLast} className="disabled:opacity-30">
          ↓
        </button>
        <button type="button" onClick={onRemove} className="text-red-500">
          odebrat
        </button>
      </div>
    </div>
  );
}

export function ExtractionReviewForm({
  form,
  onFormChange,
  photos,
  onPhotosChange,
  onSubmit,
  submitLabel,
  warnings,
}: {
  form: FormState;
  onFormChange: (next: FormState) => void;
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  onSubmit: () => Promise<void>;
  submitLabel: string;
  warnings?: string[];
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateIngredient(index: number, next: FormIngredient) {
    const ingredients = [...form.ingredients];
    ingredients[index] = next;
    onFormChange({ ...form, ingredients });
  }

  function moveIngredient(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= form.ingredients.length) return;
    const ingredients = [...form.ingredients];
    [ingredients[index], ingredients[target]] = [ingredients[target], ingredients[index]];
    onFormChange({ ...form, ingredients });
  }

  function removeIngredient(index: number) {
    onFormChange({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) });
  }

  function addIngredient() {
    onFormChange({ ...form, ingredients: [...form.ingredients, emptyIngredient()] });
  }

  function updateStep(kind: "cz" | "en", index: number, value: string) {
    const key = kind === "cz" ? "steps_cz" : "steps_en";
    const steps = [...form[key]];
    steps[index] = value;
    onFormChange({ ...form, [key]: steps });
  }

  function addStep() {
    onFormChange({ ...form, steps_cz: [...form.steps_cz, ""], steps_en: [...form.steps_en, ""] });
  }

  function removeStep(index: number) {
    onFormChange({
      ...form,
      steps_cz: form.steps_cz.filter((_, i) => i !== index),
      steps_en: form.steps_en.filter((_, i) => i !== index),
    });
  }

  function moveStep(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= form.steps_cz.length) return;
    const cz = [...form.steps_cz];
    const en = [...form.steps_en];
    [cz[index], cz[target]] = [cz[target], cz[index]];
    [en[index], en[target]] = [en[target], en[index]];
    onFormChange({ ...form, steps_cz: cz, steps_en: en });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uložení se nezdařilo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {warnings && warnings.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-medium mb-1">Zkontrolujte prosím:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-3">
        <PhotoUploader photos={photos} onChange={onPhotosChange} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.title_cz}
          onChange={(e) => onFormChange({ ...form, title_cz: e.target.value })}
          placeholder="Název (CZ)"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
        <input
          value={form.title_en}
          onChange={(e) => onFormChange({ ...form, title_en: e.target.value })}
          placeholder="Title (EN)"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
        <input
          value={form.servings}
          onChange={(e) => onFormChange({ ...form, servings: e.target.value })}
          placeholder="Počet porcí"
          inputMode="numeric"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
        <input
          value={form.prep_minutes}
          onChange={(e) => onFormChange({ ...form, prep_minutes: e.target.value })}
          placeholder="Příprava (min)"
          inputMode="numeric"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
        <input
          value={form.cook_minutes}
          onChange={(e) => onFormChange({ ...form, cook_minutes: e.target.value })}
          placeholder="Vaření/pečení (min)"
          inputMode="numeric"
          className="rounded-lg border border-stone-300 px-3 py-2"
        />
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">Ingredience</h2>
          <button type="button" onClick={addIngredient} className="text-sm text-brand-600 underline">
            + přidat ingredienci
          </button>
        </div>
        <div className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <IngredientEditor
              key={i}
              ingredient={ing}
              onChange={(next) => updateIngredient(i, next)}
              onRemove={() => removeIngredient(i)}
              onMove={(dir) => moveIngredient(i, dir)}
              isFirst={i === 0}
              isLast={i === form.ingredients.length - 1}
            />
          ))}
          {form.ingredients.length === 0 && <p className="text-sm text-stone-400">Zatím žádné ingredience.</p>}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">Postup</h2>
          <button type="button" onClick={addStep} className="text-sm text-brand-600 underline">
            + přidat krok
          </button>
        </div>
        <div className="space-y-2">
          {form.steps_cz.map((_, i) => (
            <div key={i} className="border border-stone-200 rounded-lg p-3 bg-white space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <textarea
                  value={form.steps_cz[i]}
                  onChange={(e) => updateStep("cz", i, e.target.value)}
                  placeholder={`Krok ${i + 1} (CZ)`}
                  className="rounded border border-stone-300 px-2 py-1.5 text-sm"
                  rows={2}
                />
                <textarea
                  value={form.steps_en[i]}
                  onChange={(e) => updateStep("en", i, e.target.value)}
                  placeholder={`Step ${i + 1} (EN)`}
                  className="rounded border border-stone-300 px-2 py-1.5 text-sm"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 text-xs text-stone-400">
                <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0} className="disabled:opacity-30">
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(i, 1)}
                  disabled={i === form.steps_cz.length - 1}
                  className="disabled:opacity-30"
                >
                  ↓
                </button>
                <button type="button" onClick={() => removeStep(i)} className="text-red-500">
                  odebrat
                </button>
              </div>
            </div>
          ))}
          {form.steps_cz.length === 0 && <p className="text-sm text-stone-400">Zatím žádné kroky.</p>}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 font-medium disabled:opacity-50"
      >
        {saving ? "Ukládám..." : submitLabel}
      </button>
    </form>
  );
}

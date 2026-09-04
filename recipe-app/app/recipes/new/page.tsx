"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoItem, PhotoUploader } from "@/components/PhotoUploader";
import {
  ExtractionReviewForm,
  FormState,
  buildRecipeInputFromForm,
} from "@/components/ExtractionReviewForm";
import { ExtractedRecipe } from "@/lib/types";

function extractedToForm(extracted: ExtractedRecipe): FormState {
  const stepsLength = Math.max(extracted.steps_cz.length, extracted.steps_en.length);
  const steps_cz = Array.from({ length: stepsLength }, (_, i) => extracted.steps_cz[i] ?? "");
  const steps_en = Array.from({ length: stepsLength }, (_, i) => extracted.steps_en[i] ?? "");

  return {
    title_cz: extracted.title_cz,
    title_en: extracted.title_en,
    servings: extracted.servings !== null ? String(extracted.servings) : "",
    prep_minutes: extracted.prep_minutes !== null ? String(extracted.prep_minutes) : "",
    cook_minutes: extracted.cook_minutes !== null ? String(extracted.cook_minutes) : "",
    steps_cz,
    steps_en,
    ingredients: extracted.ingredients.map((ing) => ({
      name_cz: ing.name_cz,
      name_en: ing.name_en,
      amount_metric: ing.amount !== null ? String(ing.amount) : "",
      unit_metric: ing.unit ?? "g",
      amount_us: "",
      unit_us: null,
      density_key: null,
      manual_override: false,
    })),
  };
}

export default function NewRecipePage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  async function handleExtract() {
    if (photos.length === 0) {
      setExtractError("Nahrajte alespoň jednu fotku receptu.");
      return;
    }
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: photos.map(({ filename, contentType, dataBase64 }) => ({ filename, contentType, dataBase64 })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extrakce receptu selhala.");
      setForm(extractedToForm(data));
      setWarnings(data.warnings ?? []);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Extrakce receptu selhala.");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    if (!form) return;
    const payload = {
      ...buildRecipeInputFromForm(form),
      images: photos.map(({ filename, contentType, dataBase64 }) => ({ filename, contentType, dataBase64 })),
    };
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Uložení receptu selhalo.");
    router.push(`/recipes/${data.recipe.id}`);
  }

  if (!form) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-stone-800">Nový recept</h1>
        <p className="text-sm text-stone-500">
          Nahrajte 1–10 fotek/screenshotů patřících k jednomu receptu (klidně i po částech, jak jste je fotili).
        </p>
        <PhotoUploader photos={photos} onChange={setPhotos} />
        {extractError && <p className="text-sm text-red-600">{extractError}</p>}
        <button
          type="button"
          onClick={handleExtract}
          disabled={extracting || photos.length === 0}
          className="w-full rounded-lg bg-brand-600 text-white py-2.5 font-medium disabled:opacity-50"
        >
          {extracting ? "Extrahuji recept z fotek..." : "Extrahovat recept"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-stone-800">Zkontrolujte extrahovaný recept</h1>
      <ExtractionReviewForm
        form={form}
        onFormChange={setForm}
        photos={photos}
        onPhotosChange={setPhotos}
        onSubmit={handleSave}
        submitLabel="Uložit recept"
        warnings={warnings}
      />
    </div>
  );
}

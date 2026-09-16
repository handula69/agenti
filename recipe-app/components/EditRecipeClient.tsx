"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoItem } from "./PhotoUploader";
import { ExtractionReviewForm, FormState, buildRecipeInputFromForm } from "./ExtractionReviewForm";
import { Recipe } from "@/lib/types";

function recipeToForm(recipe: Recipe): FormState {
  return {
    title_cz: recipe.title_cz,
    title_en: recipe.title_en,
    servings: recipe.servings !== null ? String(recipe.servings) : "",
    prep_minutes: recipe.prep_minutes !== null ? String(recipe.prep_minutes) : "",
    cook_minutes: recipe.cook_minutes !== null ? String(recipe.cook_minutes) : "",
    steps_cz: recipe.steps_cz,
    steps_en: recipe.steps_en,
    ingredients: recipe.ingredients.map((ing) => ({
      name_cz: ing.name_cz,
      name_en: ing.name_en,
      amount_metric: ing.amount_metric !== null ? String(ing.amount_metric) : "",
      unit_metric: ing.unit_metric,
      amount_us: ing.amount_us !== null ? String(ing.amount_us) : "",
      unit_us: ing.unit_us,
      density_key: ing.density_key,
      manual_override: ing.manual_override,
    })),
  };
}

function recipeToPhotos(recipe: Recipe): PhotoItem[] {
  return recipe.source_image_urls.map((url) => ({
    filename: url,
    contentType: "image/jpeg",
    dataBase64: "",
    previewUrl: url,
    existingUrl: url,
  }));
}

export function EditRecipeClient({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoItem[]>(() => recipeToPhotos(recipe));
  const [form, setForm] = useState<FormState>(() => recipeToForm(recipe));

  async function handleSave() {
    const existing_image_urls = photos.filter((p) => p.existingUrl).map((p) => p.existingUrl as string);
    const images = photos.filter((p) => !p.existingUrl).map(({ filename, contentType, dataBase64 }) => ({ filename, contentType, dataBase64 }));

    const payload = {
      ...buildRecipeInputFromForm(form),
      existing_image_urls,
      images,
    };
    const res = await fetch(`/api/recipes/${recipe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Uložení změn selhalo.");
    router.push(`/recipes/${recipe.id}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-stone-800">Upravit recept</h1>
      <ExtractionReviewForm
        form={form}
        onFormChange={setForm}
        photos={photos}
        onPhotosChange={setPhotos}
        onSubmit={handleSave}
        submitLabel="Uložit změny"
      />
    </div>
  );
}

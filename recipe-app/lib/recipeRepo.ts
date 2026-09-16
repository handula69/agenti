import { getSupabaseAdmin, uploadRecipeImages, RECIPE_IMAGES_BUCKET } from "./supabaseAdmin";
import { convertToUs } from "./units";
import { Recipe, RecipeInput, RecipeSummary, Ingredient, MetricUnit, UsUnit } from "./types";

interface RecipeRow {
  id: string;
  title_cz: string;
  title_en: string;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  cover_image_url: string | null;
  source_image_urls: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface StepRow {
  step_order: number;
  text_cz: string;
  text_en: string;
}

interface IngredientRow {
  id: string;
  item_order: number;
  name_cz: string;
  name_en: string;
  amount_metric: number | null;
  unit_metric: MetricUnit;
  amount_us: number | null;
  unit_us: UsUnit | null;
  density_key: string | null;
  manual_override: boolean;
}

function resolveIngredientUs(input: RecipeInput["ingredients"][number]) {
  if (input.manual_override) {
    return {
      amount_us: input.amount_us,
      unit_us: input.unit_us,
      density_key: input.density_key,
    };
  }
  const conversion = convertToUs(input.amount_metric, input.unit_metric, input.name_cz, input.name_en, input.density_key);
  return {
    amount_us: conversion.amount,
    unit_us: conversion.unit,
    density_key: conversion.densityKey,
  };
}

function zipSteps(stepsCz: string[], stepsEn: string[]) {
  const length = Math.max(stepsCz.length, stepsEn.length);
  const rows: { step_order: number; text_cz: string; text_en: string }[] = [];
  for (let i = 0; i < length; i++) {
    rows.push({ step_order: i, text_cz: stepsCz[i] ?? "", text_en: stepsEn[i] ?? "" });
  }
  return rows;
}

async function deleteStorageObjectsForUrls(urls: string[]) {
  if (urls.length === 0) return;
  try {
    const supabase = getSupabaseAdmin();
    const paths = urls
      .map((url) => {
        const marker = `/${RECIPE_IMAGES_BUCKET}/`;
        const idx = url.indexOf(marker);
        return idx >= 0 ? url.slice(idx + marker.length) : null;
      })
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) {
      await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove(paths);
    }
  } catch {
    // úklid fotek je best-effort, nesmí shodit hlavní operaci
  }
}

function mapToRecipe(row: RecipeRow, steps: StepRow[], ingredients: IngredientRow[]): Recipe {
  return {
    id: row.id,
    title_cz: row.title_cz,
    title_en: row.title_en,
    servings: row.servings,
    prep_minutes: row.prep_minutes,
    cook_minutes: row.cook_minutes,
    cover_image_url: row.cover_image_url,
    source_image_urls: row.source_image_urls ?? [],
    status: row.status as Recipe["status"],
    created_at: row.created_at,
    updated_at: row.updated_at,
    steps_cz: steps.map((s) => s.text_cz),
    steps_en: steps.map((s) => s.text_en),
    ingredients: ingredients.map(
      (ing): Ingredient => ({
        id: ing.id,
        order: ing.item_order,
        name_cz: ing.name_cz,
        name_en: ing.name_en,
        amount_metric: ing.amount_metric,
        unit_metric: ing.unit_metric,
        amount_us: ing.amount_us,
        unit_us: ing.unit_us,
        density_key: ing.density_key,
        manual_override: ing.manual_override,
      })
    ),
  };
}

export async function listRecipes(search?: string): Promise<RecipeSummary[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("recipes")
    .select("id, title_cz, title_en, cover_image_url, servings, created_at")
    .order("created_at", { ascending: false });

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    query = query.or(`title_cz.ilike.${term},title_en.ilike.${term}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Načtení receptů selhalo: ${error.message}`);
  return data as RecipeSummary[];
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const supabase = getSupabaseAdmin();

  const { data: recipeRow, error: recipeError } = await supabase.from("recipes").select("*").eq("id", id).maybeSingle();
  if (recipeError) throw new Error(`Načtení receptu selhalo: ${recipeError.message}`);
  if (!recipeRow) return null;

  const [{ data: steps, error: stepsError }, { data: ingredients, error: ingredientsError }] = await Promise.all([
    supabase.from("recipe_steps").select("step_order, text_cz, text_en").eq("recipe_id", id).order("step_order"),
    supabase.from("recipe_ingredients").select("*").eq("recipe_id", id).order("item_order"),
  ]);
  if (stepsError) throw new Error(`Načtení kroků selhalo: ${stepsError.message}`);
  if (ingredientsError) throw new Error(`Načtení ingrediencí selhalo: ${ingredientsError.message}`);

  return mapToRecipe(recipeRow as RecipeRow, (steps ?? []) as StepRow[], (ingredients ?? []) as IngredientRow[]);
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const supabase = getSupabaseAdmin();
  const uploadedUrls = await uploadRecipeImages(input.images);
  const sourceImageUrls = uploadedUrls;

  const { data: recipeRow, error: insertError } = await supabase
    .from("recipes")
    .insert({
      title_cz: input.title_cz,
      title_en: input.title_en,
      servings: input.servings,
      prep_minutes: input.prep_minutes,
      cook_minutes: input.cook_minutes,
      cover_image_url: sourceImageUrls[0] ?? null,
      source_image_urls: sourceImageUrls,
      status: "ready",
    })
    .select("*")
    .single();
  if (insertError) throw new Error(`Uložení receptu selhalo: ${insertError.message}`);

  const recipeId = recipeRow.id as string;
  await writeStepsAndIngredients(recipeId, input);

  const created = await getRecipe(recipeId);
  if (!created) throw new Error("Recept se nepodařilo znovu načíst po uložení.");
  return created;
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<Recipe> {
  const supabase = getSupabaseAdmin();
  const existing = await getRecipe(id);
  if (!existing) throw new Error("Recept nenalezen.");

  const keepUrls = input.existing_image_urls ?? existing.source_image_urls;
  const removedUrls = existing.source_image_urls.filter((url) => !keepUrls.includes(url));
  const uploadedUrls = await uploadRecipeImages(input.images);
  const sourceImageUrls = [...keepUrls, ...uploadedUrls];

  const { error: updateError } = await supabase
    .from("recipes")
    .update({
      title_cz: input.title_cz,
      title_en: input.title_en,
      servings: input.servings,
      prep_minutes: input.prep_minutes,
      cook_minutes: input.cook_minutes,
      cover_image_url: sourceImageUrls[0] ?? null,
      source_image_urls: sourceImageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) throw new Error(`Aktualizace receptu selhala: ${updateError.message}`);

  await supabase.from("recipe_steps").delete().eq("recipe_id", id);
  await supabase.from("recipe_ingredients").delete().eq("recipe_id", id);
  await writeStepsAndIngredients(id, input);

  await deleteStorageObjectsForUrls(removedUrls);

  const updated = await getRecipe(id);
  if (!updated) throw new Error("Recept se nepodařilo znovu načíst po aktualizaci.");
  return updated;
}

export async function deleteRecipe(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const existing = await getRecipe(id);
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(`Smazání receptu selhalo: ${error.message}`);
  if (existing) await deleteStorageObjectsForUrls(existing.source_image_urls);
}

async function writeStepsAndIngredients(recipeId: string, input: RecipeInput) {
  const supabase = getSupabaseAdmin();

  const stepRows = zipSteps(input.steps_cz, input.steps_en).map((s) => ({ ...s, recipe_id: recipeId }));
  if (stepRows.length > 0) {
    const { error } = await supabase.from("recipe_steps").insert(stepRows);
    if (error) throw new Error(`Uložení kroků selhalo: ${error.message}`);
  }

  const ingredientRows = input.ingredients.map((ing, index) => {
    const resolved = resolveIngredientUs(ing);
    return {
      recipe_id: recipeId,
      item_order: index,
      name_cz: ing.name_cz,
      name_en: ing.name_en,
      amount_metric: ing.amount_metric,
      unit_metric: ing.unit_metric,
      amount_us: resolved.amount_us,
      unit_us: resolved.unit_us,
      density_key: resolved.density_key,
      manual_override: ing.manual_override,
    };
  });
  if (ingredientRows.length > 0) {
    const { error } = await supabase.from("recipe_ingredients").insert(ingredientRows);
    if (error) throw new Error(`Uložení ingrediencí selhalo: ${error.message}`);
  }
}

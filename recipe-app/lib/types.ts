export type MetricUnit = "g" | "ml" | "ks" | "lžíce" | "lžička" | "špetka";
export type UsUnit = "cup" | "tbsp" | "tsp" | "oz" | "ks" | "pinch";

export interface Ingredient {
  id: string;
  order: number;
  name_cz: string;
  name_en: string;
  amount_metric: number | null;
  unit_metric: MetricUnit;
  amount_us: number | null;
  unit_us: UsUnit | null;
  density_key: string | null;
  manual_override: boolean;
}

export interface Recipe {
  id: string;
  title_cz: string;
  title_en: string;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  cover_image_url: string | null;
  source_image_urls: string[];
  status: "draft" | "ready";
  created_at: string;
  updated_at: string;
  steps_cz: string[];
  steps_en: string[];
  ingredients: Ingredient[];
}

export interface ExtractedIngredient {
  name_cz: string;
  name_en: string;
  amount: number | null;
  unit: MetricUnit | null;
}

export interface ExtractedRecipe {
  title_cz: string;
  title_en: string;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  ingredients: ExtractedIngredient[];
  steps_cz: string[];
  steps_en: string[];
  warnings: string[];
}

export interface UploadedImage {
  filename: string;
  contentType: string;
  dataBase64: string;
}

export interface RecipeSummary {
  id: string;
  title_cz: string;
  title_en: string;
  cover_image_url: string | null;
  servings: number | null;
  created_at: string;
}

export interface IngredientInput {
  name_cz: string;
  name_en: string;
  amount_metric: number | null;
  unit_metric: MetricUnit;
  amount_us: number | null;
  unit_us: UsUnit | null;
  density_key: string | null;
  manual_override: boolean;
}

export interface RecipeInput {
  title_cz: string;
  title_en: string;
  servings: number | null;
  prep_minutes: number | null;
  cook_minutes: number | null;
  images: UploadedImage[];
  existing_image_urls?: string[];
  steps_cz: string[];
  steps_en: string[];
  ingredients: IngredientInput[];
}

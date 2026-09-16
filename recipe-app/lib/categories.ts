export type CategoryKey = "soup" | "main" | "side" | "salad" | "baking" | "dessert" | "drink" | "other";

export interface CategoryDef {
  key: CategoryKey;
  labelCz: string;
  labelEn: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "soup", labelCz: "Polévky", labelEn: "Soups" },
  { key: "main", labelCz: "Hlavní jídla", labelEn: "Main dishes" },
  { key: "side", labelCz: "Přílohy", labelEn: "Side dishes" },
  { key: "salad", labelCz: "Saláty", labelEn: "Salads" },
  { key: "baking", labelCz: "Pečení", labelEn: "Baking" },
  { key: "dessert", labelCz: "Dezerty", labelEn: "Desserts" },
  { key: "drink", labelCz: "Nápoje", labelEn: "Drinks" },
  { key: "other", labelCz: "Ostatní", labelEn: "Other" },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as CategoryKey[];

export function isCategoryKey(value: string | null | undefined): value is CategoryKey {
  return !!value && (CATEGORY_KEYS as string[]).includes(value);
}

export function getCategoryLabel(key: CategoryKey, mode: "cz" | "en"): string {
  const found = CATEGORIES.find((c) => c.key === key);
  if (!found) return key;
  return mode === "cz" ? found.labelCz : found.labelEn;
}

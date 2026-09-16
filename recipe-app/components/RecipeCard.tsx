import Link from "next/link";
import { RecipeSummary } from "@/lib/types";
import { getCategoryLabel } from "@/lib/categories";

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex gap-3 items-center bg-white rounded-xl border border-stone-200 p-3 hover:border-brand-300 hover:shadow-sm transition-shadow"
    >
      <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0">
        {recipe.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-stone-900 truncate">{recipe.title_cz || recipe.title_en}</p>
        {recipe.title_en && recipe.title_cz && (
          <p className="text-sm text-stone-500 truncate">{recipe.title_en}</p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">
            {getCategoryLabel(recipe.category, "cz")}
          </span>
          {recipe.servings && <span className="text-xs text-stone-400">{recipe.servings} porcí</span>}
        </div>
      </div>
    </Link>
  );
}

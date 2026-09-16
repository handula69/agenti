import Link from "next/link";
import { RecipeSummary } from "@/lib/types";

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
        {recipe.servings && <p className="text-xs text-stone-400 mt-0.5">{recipe.servings} porcí</p>}
      </div>
    </Link>
  );
}

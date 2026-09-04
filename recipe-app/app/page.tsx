import { Suspense } from "react";
import { listRecipes } from "@/lib/recipeRepo";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

async function RecipeList({ q }: { q?: string }) {
  const recipes = await listRecipes(q);

  if (recipes.length === 0) {
    return (
      <p className="text-stone-500 text-center py-12">
        {q ? "Žádný recept neodpovídá hledání." : "Zatím žádné recepty. Přidejte první přes „+ Nový recept“."}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {recipes.map((r) => (
        <li key={r.id}>
          <RecipeCard recipe={r} />
        </li>
      ))}
    </ul>
  );
}

export default function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <div className="space-y-4">
      <Suspense>
        <SearchBar />
      </Suspense>
      <Suspense fallback={<p className="text-stone-400 text-center py-12">Načítám...</p>}>
        <RecipeList q={searchParams.q} />
      </Suspense>
    </div>
  );
}

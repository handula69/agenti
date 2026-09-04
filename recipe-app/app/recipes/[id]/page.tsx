import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipeRepo";
import { RecipeDetailClient } from "@/components/RecipeDetailClient";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  if (!recipe) notFound();
  return <RecipeDetailClient recipe={recipe} />;
}

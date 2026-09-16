import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipeRepo";
import { EditRecipeClient } from "@/components/EditRecipeClient";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  if (!recipe) notFound();
  return <EditRecipeClient recipe={recipe} />;
}

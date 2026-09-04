import { NextRequest, NextResponse } from "next/server";
import { listRecipes, createRecipe } from "@/lib/recipeRepo";
import { RecipeInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("q") ?? undefined;
  try {
    const recipes = await listRecipes(search);
    return NextResponse.json({ recipes });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Načtení receptů selhalo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: RecipeInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  if (!body.title_cz && !body.title_en) {
    return NextResponse.json({ error: "Recept musí mít alespoň jeden název." }, { status: 400 });
  }

  try {
    const recipe = await createRecipe(body);
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Uložení receptu selhalo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

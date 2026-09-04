import Anthropic from "@anthropic-ai/sdk";
import { ExtractedRecipe, UploadedImage } from "./types";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Chybí ANTHROPIC_API_KEY v environment proměnných.");
  }
  client = new Anthropic({ apiKey });
  return client;
}

type SupportedMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";
const SUPPORTED_MEDIA_TYPES: SupportedMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const SYSTEM_PROMPT = `Jsi asistent, který extrahuje recepty ze screenshotů z Instagramu. Fotek může být 1 až 10 a patří k JEDNOMU receptu - často je potřeba je poskládat dohromady, protože se recept nevešel na jeden snímek.

Pravidla:
- Slož informace ze VŠECH přiložených fotek dohromady, i když jsou části receptu (ingredience, postup) na různých snímcích.
- Pokud je text jen v jednom jazyce (čeština nebo angličtina), přelož název, kroky přípravy i názvy ingrediencí do druhého jazyka. Čísla a jednotky se nepřekládají.
- Množství ingredience zapiš jako číslo (amount) a jednotku (unit) POUZE z množiny: g, ml, ks, lžíce, lžička, špetka. Pokud fotka uvádí jinou jednotku (hrnek, plátek, stroužek, konzerva...), zvol nejbližší z množiny a upřesnění dopiš do názvu ingredience (např. "stroužek česneku" jako 1 ks).
- Pokud nějaká hodnota (množství, jednotka, čas přípravy, počet porcí) na fotkách chybí nebo není čitelná, NIKDY si ji nevymýšlej - použij null.
- Pokud si nejsi jistý přečtením některé části (rozmazané, oříznuté, chybí navazující fotka), přidej krátkou českou poznámku do pole "warnings", ať uživatel ví, co zkontrolovat/doplnit ručně.
- Kroky přípravy zachovej v pořadí, jeden krok = jedna položka pole.
- Zavolej nástroj record_recipe přesně jednou s kompletním výsledkem.`;

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_recipe",
  description: "Zaznamená strukturovaná data receptu vyčtená ze screenshotů.",
  input_schema: {
    type: "object",
    properties: {
      title_cz: { type: "string" },
      title_en: { type: "string" },
      servings: { type: ["number", "null"] },
      prep_minutes: { type: ["number", "null"] },
      cook_minutes: { type: ["number", "null"] },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name_cz: { type: "string" },
            name_en: { type: "string" },
            amount: { type: ["number", "null"] },
            unit: { type: ["string", "null"], enum: ["g", "ml", "ks", "lžíce", "lžička", "špetka", null] },
          },
          required: ["name_cz", "name_en", "amount", "unit"],
        },
      },
      steps_cz: { type: "array", items: { type: "string" } },
      steps_en: { type: "array", items: { type: "string" } },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: [
      "title_cz",
      "title_en",
      "servings",
      "prep_minutes",
      "cook_minutes",
      "ingredients",
      "steps_cz",
      "steps_en",
      "warnings",
    ],
  },
};

export async function extractRecipeFromImages(images: UploadedImage[]): Promise<ExtractedRecipe> {
  if (images.length === 0) {
    throw new Error("Nebyla nahrána žádná fotka.");
  }
  if (images.length > 10) {
    throw new Error("Maximální počet fotek na jeden recept je 10.");
  }

  const imageBlocks: Anthropic.ImageBlockParam[] = images.map((img) => {
    const mediaType = SUPPORTED_MEDIA_TYPES.includes(img.contentType as SupportedMediaType)
      ? (img.contentType as SupportedMediaType)
      : "image/jpeg";
    return {
      type: "image",
      source: { type: "base64", media_type: mediaType, data: img.dataBase64 },
    };
  });

  let response: Anthropic.Message;
  try {
    response = await getClient().messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "record_recipe" },
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            {
              type: "text",
              text: "Toto jsou fotky jednoho receptu, v pořadí v jakém byly nahrány. Extrahuj strukturovaná data podle instrukcí.",
            },
          ],
        },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neznámá chyba Claude API.";
    throw new Error(`Volání Claude API selhalo: ${message}`);
  }

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "record_recipe"
  );
  if (!toolUse) {
    throw new Error("Claude nevrátil očekávaná strukturovaná data. Zkuste to prosím znovu.");
  }

  const raw = toolUse.input as Partial<ExtractedRecipe>;
  return {
    title_cz: raw.title_cz ?? "",
    title_en: raw.title_en ?? "",
    servings: raw.servings ?? null,
    prep_minutes: raw.prep_minutes ?? null,
    cook_minutes: raw.cook_minutes ?? null,
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    steps_cz: Array.isArray(raw.steps_cz) ? raw.steps_cz : [],
    steps_en: Array.isArray(raw.steps_en) ? raw.steps_en : [],
    warnings: Array.isArray(raw.warnings) ? raw.warnings : [],
  };
}

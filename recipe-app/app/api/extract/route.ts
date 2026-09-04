import { NextRequest, NextResponse } from "next/server";
import { extractRecipeFromImages } from "@/lib/anthropic";
import { UploadedImage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { images?: UploadedImage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  const images = body.images ?? [];
  if (images.length === 0) {
    return NextResponse.json({ error: "Nahrajte alespoň jednu fotku receptu." }, { status: 400 });
  }
  if (images.length > 10) {
    return NextResponse.json({ error: "Maximálně 10 fotek na jeden recept." }, { status: 400 });
  }

  try {
    const extracted = await extractRecipeFromImages(images);
    return NextResponse.json(extracted);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extrakce receptu selhala.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

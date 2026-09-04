import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UploadedImage } from "./types";

// Service-role klient běží výhradně na serveru (API routes / server komponenty).
// Service role key nesmí nikdy uniknout do klientského kódu.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Chybí SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v environment proměnných.");
  }

  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}

export const RECIPE_IMAGES_BUCKET = "recipe-images";

export async function uploadRecipeImages(images: UploadedImage[]): Promise<string[]> {
  if (images.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const urls: string[] = [];

  for (const img of images) {
    const ext = img.contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(img.dataBase64, "base64");

    const { error } = await supabase.storage.from(RECIPE_IMAGES_BUCKET).upload(path, buffer, {
      contentType: img.contentType,
      upsert: false,
    });
    if (error) {
      throw new Error(`Nahrání fotky "${img.filename}" selhalo: ${error.message}`);
    }

    const { data } = supabase.storage.from(RECIPE_IMAGES_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

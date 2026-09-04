# Rodinné recepty

Webová appka na správu receptů extrahovaných z fotek/screenshotů Instagramu. Nahrajete 1–10 fotek jednoho receptu, Claude API (vision) z nich vytáhne strukturovaná data, vy je zkontrolujete/opravíte a uložíte. Recept lze zobrazit česky v gramech nebo anglicky v cups/oz.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind - frontend i serverless API routes v jednom.
- **Supabase** - Postgres (data receptů) + Storage (fotky). Zdarma tier stačí na rodinné použití.
- **Claude API** (`@anthropic-ai/sdk`) - extrakce strukturovaných dat z fotek přes vision + tool use. Volání jde vždy přes server (`/api/extract`), API klíč nikdy neopouští backend.
- Nasazení: **Vercel** (serverless funkce potřebují Node runtime, GitHub Pages/čistě statický hosting nestačí).

## Nastavení

### 1. Supabase

1. Vytvořte nový projekt na [supabase.com](https://supabase.com).
2. V SQL editoru spusťte obsah `supabase/schema.sql` - vytvoří tabulky `recipes`, `recipe_steps`, `recipe_ingredients` a storage bucket `recipe-images`.
3. V Project Settings → API zkopírujte `Project URL` a `service_role` klíč (ne `anon`!).

### 2. Claude API

Vytvořte klíč na [console.anthropic.com](https://console.anthropic.com) a nastavte jako `ANTHROPIC_API_KEY`. Model pro vision extrakci je konfigurovatelný přes `ANTHROPIC_MODEL`.

### 3. Environment proměnné

Zkopírujte `.env.example` do `.env.local` a doplňte hodnoty:

```
cp .env.example .env.local
```

`APP_PIN` je sdílené heslo pro vstup do appky (rodinné použití, žádné účty). `SESSION_SECRET` je libovolný dlouhý náhodný řetězec použitý na podepsání session cookie.

### 4. Lokální běh

```
npm install
npm run dev
```

### 5. Nasazení na Vercel

1. Připojte repo/adresář `recipe-app` k novému Vercel projektu (Root Directory = `recipe-app`).
2. V Project Settings → Environment Variables nastavte stejné proměnné jako v `.env.local`.
3. Deploy.

## Jak to funguje

- **Nahrání a extrakce**: `/recipes/new` - nahrajete fotky (client si je zmenší na max. 1600px, ať nejsou zbytečně velké), zavolá se `/api/extract`, Claude vrátí název, ingredience, kroky, porce a časy. Chybějící/nejisté údaje jsou `null` + poznámka ve `warnings` - appka si nic nevymýšlí, doplnění je na vás ve formuláři před uložením.
- **CZ/EN a g/cups**: gramy jsou uložené jako "zdroj pravdy", cups se dopočítávají podle tabulky hustot (`lib/densityTable.ts`) pro danou surovinu. Pokud surovina není v tabulce, appka nehádá objem a zobrazí jen orientační přepočet váhy na oz. Každý přepočtený údaj je označen "≈ přibližně". U jednotlivé ingredience jde převod kdykoliv ručně přepsat (uloží se natrvalo, appka ho pak nepřepočítává).
- **Databáze**: recepty, kroky a ingredience v Supabase Postgres; fotky ve Supabase Storage (bucket `recipe-images`, veřejné čtení, zápis jen přes service role key ze serveru).
- **Přístup**: jednoduchý sdílený PIN (`/login`), session cookie podepsané `SESSION_SECRET`. Middleware (`middleware.ts`) chrání všechny stránky i API kromě `/login` a `/api/auth`.
- **PWA**: `public/manifest.json` + `public/sw.js` umožňují "Přidat na plochu" na mobilu. Ikona je zatím jen SVG placeholder (`public/icons/icon.svg`) - pro lepší kompatibilitu doporučuji doplnit skutečné PNG 192×192 a 512×512.

## Tabulka hustot (g ↔ cups)

Viz `lib/densityTable.ts`. Obsahuje běžné pečicí suroviny (mouka, cukry, máslo, mléko, olej, med, kakao, ovesné vločky, mleté ořechy, strouhaný sýr, rýže, kypřicí prášek, soda, sůl). Jde o orientační hodnoty z běžně používaných US baking konverzních tabulek, ne fyzikálně přesná data - proto je převod vždy označen jako přibližný. Snadno se dá rozšířit o další suroviny přidáním řádku do pole `densityTable`.

## Ošetřené chybové stavy

- Nečitelná/poškozená fotka při zmenšování na klientovi → chybová hláška, ostatní fotky zůstanou.
- Chyba Claude API (timeout, rate limit, neplatný klíč) → `/api/extract` vrátí srozumitelnou chybu, uživatel může zkusit znovu.
- Chybějící část receptu na fotkách → pole zůstanou `null`/prázdná + poznámka ve `warnings`, recept se dá i tak upravit a uložit.
- Chybějící env proměnné (Supabase/Anthropic/PIN) → appka vrátí jasnou chybu místo pádu.

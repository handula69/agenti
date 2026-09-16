-- Schéma pro aplikaci "Rodinné recepty".
-- Spusťte v Supabase SQL editoru (Project -> SQL Editor -> New query).

create extension if not exists "pgcrypto";

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title_cz text not null default '',
  title_en text not null default '',
  servings int,
  prep_minutes int,
  cook_minutes int,
  cover_image_url text,
  source_image_urls text[] not null default '{}',
  status text not null default 'ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  step_order int not null,
  text_cz text not null default '',
  text_en text not null default ''
);
create index if not exists recipe_steps_recipe_id_idx on recipe_steps(recipe_id);

create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  item_order int not null,
  name_cz text not null default '',
  name_en text not null default '',
  amount_metric numeric,
  unit_metric text not null default 'g',
  amount_us numeric,
  unit_us text,
  density_key text,
  manual_override boolean not null default false
);
create index if not exists recipe_ingredients_recipe_id_idx on recipe_ingredients(recipe_id);

-- Row Level Security je zapnuté, ale bez veřejných policies -
-- aplikace přistupuje k datům pouze přes server (service role key),
-- který RLS obchází. Přímý přístup z prohlížeče (anon key) je tak zablokovaný.
alter table recipes enable row level security;
alter table recipe_steps enable row level security;
alter table recipe_ingredients enable row level security;

-- Storage bucket pro fotky receptů. Veřejné čtení (potřebné pro <img src>),
-- zápis jen přes service role key ze serveru.
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

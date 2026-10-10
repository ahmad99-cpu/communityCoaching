-- 6SLOT giveaway entries + draws (the "Spin" in the admin Giveaway tab).
-- Run once in the Supabase SQL editor, AFTER admin.sql. Admin-only: visitors can't see any of it.

-- Names entered into a giveaway. `giveaway_id` is the id of a giveaway in the
-- site_content 'giveaway' section (each giveaway card has its own id).
create table if not exists public.giveaway_entries (
  id          uuid primary key default gen_random_uuid(),
  giveaway_id text not null,
  name        text not null check (char_length(btrim(name)) between 1 and 100),
  -- Normalised name used for the duplicate check: lower-case, no leading @,
  -- spaces collapsed. "Ghosty", " ghosty ", "@GHOSTY" are all the same entry.
  name_key    text generated always as (
                lower(regexp_replace(regexp_replace(btrim(name), '^@+', ''), '\s+', ' ', 'g'))
              ) stored,
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid() references auth.users (id) on delete set null,
  unique (giveaway_id, name_key)
);

create index if not exists giveaway_entries_giveaway_idx on public.giveaway_entries (giveaway_id, created_at);

-- Every spin, kept forever: who won, when, out of how many, and what the prize was.
create table if not exists public.giveaway_draws (
  id            uuid primary key default gen_random_uuid(),
  giveaway_id   text not null,
  -- Snapshot of the prize at draw time, so history stays right if the card is edited later.
  prize         jsonb not null,
  winner_name   text not null,
  entries_count int  not null check (entries_count > 0),
  drawn_at      timestamptz not null default now(),
  drawn_by      uuid default auth.uid() references auth.users (id) on delete set null
);

create index if not exists giveaway_draws_giveaway_idx on public.giveaway_draws (giveaway_id, drawn_at desc);

alter table public.giveaway_entries enable row level security;
alter table public.giveaway_draws enable row level security;

drop policy if exists "admins manage giveaway entries" on public.giveaway_entries;
create policy "admins manage giveaway entries" on public.giveaway_entries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Draws can be recorded and read, but never edited or deleted: the history stays honest.
drop policy if exists "admins read draws" on public.giveaway_draws;
create policy "admins read draws" on public.giveaway_draws
  for select to authenticated using (public.is_admin());

drop policy if exists "admins record draws" on public.giveaway_draws;
create policy "admins record draws" on public.giveaway_draws
  for insert to authenticated with check (public.is_admin());

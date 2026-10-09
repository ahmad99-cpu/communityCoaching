-- 6SLOT free-tool leads (wheel test + position test).
-- Run once in the Supabase SQL editor.
create table if not exists public.leads (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  source     text not null check (source in ('wheel_test', 'position_test')),
  discord    text not null check (char_length(discord) between 2 and 64),
  result     jsonb
);

alter table public.leads enable row level security;

-- Visitors can submit a lead but can never read anyone's leads.
-- Jad reads them from the Supabase dashboard (Table editor > leads).
create policy "anyone can insert leads"
  on public.leads for insert
  to anon
  with check (true);

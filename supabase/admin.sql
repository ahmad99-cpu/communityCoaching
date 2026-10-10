-- 6SLOT admin dashboard. Run once in the Supabase SQL editor, AFTER subscriptions.sql.
--
-- Creating the two admin accounts:
--   1. Supabase > Authentication > Users > "Add user" (email + password) for each admin.
--   2. Supabase > Authentication > Providers > Email: turn OFF "Allow new users to sign up",
--      so nobody else can create an account.
--   3. Run, with your two emails:
--        insert into public.admins (user_id)
--        select id from auth.users where email in ('you@example.com', 'brother@example.com');

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies: the list is only readable through is_admin().

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Editable site content (giveaway, pricing cards, FAQ, wheel test, position test)
-- One row per section; `value` is the whole section as JSON. Missing rows = the
-- defaults built into the site (src/content/defaults.ts).
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  key        text primary key check (key in ('giveaway', 'pricing', 'faq', 'wheel_test', 'position_test', 'next_session')),
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.site_content enable row level security;

drop policy if exists "content is public" on public.site_content;
create policy "content is public" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "admins write content" on public.site_content;
create policy "admins write content" on public.site_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.stamp_site_content() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_content_stamp on public.site_content;
create trigger site_content_stamp before insert or update on public.site_content
  for each row execute function public.stamp_site_content();

-- ---------------------------------------------------------------------------
-- Students (= subscriptions) — extra columns for the Students page
-- ---------------------------------------------------------------------------
alter table public.subscriptions add column if not exists activated_at    timestamptz;
alter table public.subscriptions add column if not exists next_billing_at timestamptz;
alter table public.subscriptions add column if not exists payer_name      text;
alter table public.subscriptions add column if not exists discord         text;

-- Remember when a subscription first became active ("subscribed on").
create or replace function public.stamp_activated_at() returns trigger language plpgsql as $$
begin
  if new.status = 'active' and new.activated_at is null then
    new.activated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists subscriptions_activated on public.subscriptions;
create trigger subscriptions_activated before insert or update on public.subscriptions
  for each row execute function public.stamp_activated_at();

update public.subscriptions set activated_at = coalesce(activated_at, created_at) where status = 'active';

drop policy if exists "admins manage subscriptions" on public.subscriptions;
create policy "admins manage subscriptions" on public.subscriptions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admins can also read the free-tool leads (Discord usernames).
drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads" on public.leads
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Images (giveaway prizes): public bucket, admins upload
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "admins upload site assets" on storage.objects;
create policy "admins upload site assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "admins update site assets" on storage.objects;
create policy "admins update site assets" on storage.objects
  for update to authenticated using (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "admins delete site assets" on storage.objects;
create policy "admins delete site assets" on storage.objects
  for delete to authenticated using (bucket_id = 'site-assets' and public.is_admin());

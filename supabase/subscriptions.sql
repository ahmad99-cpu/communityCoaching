-- 6SLOT subscriptions: the source of truth for the founder counter and giveaway progress.
-- Run once in the Supabase SQL editor (after leads.sql).
--
-- Rows are written ONLY by the Edge Functions (service role) or by Jad by hand in the
-- dashboard. Visitors can't read the table; they only get the counts via get_member_counts().

create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  plan                   text not null check (plan in ('founder', 'member')),
  -- pending   = checkout opened, spot held for 30 min (see reserve_spot)
  -- active    = paid / subscription active
  -- cancelled / suspended / expired = no longer counts
  status                 text not null default 'pending'
                         check (status in ('pending', 'active', 'cancelled', 'suspended', 'expired')),
  -- 'paypal' for real checkouts, 'manual' for members Jad adds by hand (e.g. referral deals).
  source                 text not null default 'paypal' check (source in ('paypal', 'manual')),
  paypal_subscription_id text unique,
  payer_email            text,
  last_payment_at        timestamptz,
  note                   text
);

create index if not exists subscriptions_plan_status_idx on public.subscriptions (plan, status);

alter table public.subscriptions enable row level security;
-- No policies on purpose: anon/authenticated can't read or write rows directly.

-- Founder spots. Change here if the cap ever changes (keep src/config/site.ts in sync).
create or replace function public.founder_cap() returns int language sql immutable as $$ select 25 $$;

-- How long an unpaid checkout holds a founder spot.
create or replace function public.pending_hold() returns interval language sql immutable as $$ select interval '30 minutes' $$;

/**
 * Public counts for the website. Only active subscriptions count toward the display,
 * so the counter moves when someone actually pays.
 */
create or replace function public.get_member_counts()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'founders', count(*) filter (where plan = 'founder' and status = 'active'),
    'members',  count(*) filter (where status = 'active'),
    'founder_cap', public.founder_cap()
  )
  from public.subscriptions;
$$;

revoke all on function public.get_member_counts() from public;
grant execute on function public.get_member_counts() to anon, authenticated;

/**
 * Atomically holds a spot before a PayPal subscription is created.
 * For founders, refuses once active + still-held pending founders reach the cap, so two
 * people paying at the same moment can't both take the last spot.
 * Returns the new row id, or null when founder spots are gone.
 * Called only by the paypal-create-subscription Edge Function (service role).
 */
create or replace function public.reserve_spot(p_plan text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  taken int;
  new_id uuid;
begin
  if p_plan not in ('founder', 'member') then
    raise exception 'invalid plan %', p_plan;
  end if;

  -- Serialise reservations so the count check and the insert can't interleave.
  perform pg_advisory_xact_lock(hashtext('6slot_reserve_spot'));

  -- Drop abandoned checkouts so they stop holding spots.
  delete from subscriptions
   where status = 'pending' and created_at < now() - public.pending_hold();

  select count(*) into taken
    from subscriptions
   where plan = 'founder' and status in ('active', 'pending');

  if p_plan = 'founder' and taken >= public.founder_cap() then
    return null;
  end if;
  -- The member plan only opens once founders are sold out (brief §3.7): that means
  -- paid founders, not checkouts that might still be abandoned.
  if p_plan = 'member'
     and (select count(*) from subscriptions where plan = 'founder' and status = 'active') < public.founder_cap() then
    return null;
  end if;

  insert into subscriptions (plan, status) values (p_plan, 'pending') returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.reserve_spot(text) from public, anon, authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

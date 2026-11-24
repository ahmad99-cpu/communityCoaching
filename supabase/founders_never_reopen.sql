-- Founder spots never reopen (2026-11-24): once 25 founders have paid, a founder who cancels just
-- loses the $19 price. So both checks count every founder who ever paid (any status but pending),
-- not only the active ones. Without this, one cancellation blocked the Member plan.
-- Run once in the Supabase SQL editor. Same function as in subscriptions.sql.
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

  -- Every founder who ever paid, plus checkouts still holding a spot.
  select count(*) into taken
    from subscriptions
   where plan = 'founder';

  if p_plan = 'founder' and taken >= public.founder_cap() then
    return null;
  end if;
  -- The member plan opens once founders are sold out: paid founders (cancelled ones included),
  -- not checkouts that might still be abandoned.
  if p_plan = 'member'
     and (select count(*) from subscriptions where plan = 'founder' and status <> 'pending') < public.founder_cap() then
    return null;
  end if;

  insert into subscriptions (plan, status) values (p_plan, 'pending') returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.reserve_spot(text) from public, anon, authenticated;

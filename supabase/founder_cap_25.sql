-- Raises the founder cap from 20 to 25 ($19 founder price for the first 25 members).
-- Run once in the Supabase SQL editor. Keep in sync with founderSpots in src/config/site.ts.
create or replace function public.founder_cap() returns int language sql immutable as $$ select 25 $$;

-- Lets the dashboard save the "Next session" card (topic + date) to site_content.
-- Run once in the Supabase SQL editor. Safe to run again.
alter table public.site_content drop constraint if exists site_content_key_check;
alter table public.site_content
  add constraint site_content_key_check
  check (key in ('giveaway', 'pricing', 'faq', 'wheel_test', 'position_test', 'next_session'));

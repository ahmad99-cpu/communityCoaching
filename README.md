# Community Coaching (working title) — Arab Dota 2 Community Platform

Bilingual (Arabic + English) Dota 2 coaching-content and community platform, modeled on
[dotaflix.com.br](https://www.dotaflix.com.br/) but built around a **roster of coaches**
(Eixn + named pro players) rather than one coach's personal brand.

**Read [`SPEC.md`](./SPEC.md) first.** It's the full content/product spec — what's kept from
the Dotaflix model, what's added for the Arab community, the coach roster, payments, site
structure, design direction, roadmap, and the open decisions that still need answers before
this becomes a real build (brand name, roster identities/rights, pricing, etc.).

This is a **standalone project** — its own repo, its own database, its own hosting. Not
connected to any other project on this machine.

---

## Stack

React + Vite + TypeScript, Tailwind CSS (+ `tailwindcss-rtl`), React Router, `react-i18next`,
Supabase (not yet provisioned — see below).

## What's scaffolded so far

- Bilingual routing: every page lives under `/en/...` or `/ar/...`, with a persistent language
  toggle (not an IP redirect) — see `src/components/layout/Layout.tsx` and `LanguageToggle.tsx`.
- RTL is wired at the root: switching to `/ar/*` sets `<html dir="rtl" lang="ar">`, so Tailwind's
  `rtl:` variants and the `tailwindcss-rtl` plugin work correctly everywhere, not just on pages
  someone remembered to mirror manually.
- One placeholder page per nav item from SPEC.md §7 (`src/pages/PagePlaceholder.tsx`, driven by
  `src/i18n/locales/{en,ar}.json`) — real content goes in page by page.
- A Supabase client stub (`src/lib/supabase.ts`) that warns loudly instead of crashing when
  `.env` isn't filled in yet — expected until a Supabase project exists (see below).

## What's *not* built yet (deliberately)

Everything downstream of the open decisions in SPEC.md §10 — auth, subscriptions/payments,
the lesson library, live session scheduling, the coach roster data model, etc. Building those
before the roster identities, brand name, and pricing are locked would mean rebuilding them.

## Local development

```bash
npm install
cp .env.example .env   # fill in once a Supabase project exists — see SPEC.md §11
npm run dev
```

Runs at `http://localhost:5174` (`eixnSystem`'s Coach OS app already uses 5173, if you ever
run both at once).

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | Typecheck only |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build locally |

## Project structure

```
src/
  App.tsx              route table — keep in sync with Nav.tsx and SPEC.md §7
  components/layout/    Layout (sets <html dir>/<html lang>), Nav, LanguageToggle
  pages/                one component per nav item (placeholders for now)
  i18n/                 react-i18next setup + en.json / ar.json
  lib/supabase.ts       Supabase client (stubbed until a project exists)
SPEC.md                 the actual product/content spec — read this, not just this README
```

## Database

Not provisioned yet. Per SPEC.md §11: create a **new, dedicated Supabase project** for this
platform (do not reuse eixnSystem/Coach OS's project — separate database, separate app), copy
its URL/anon key into `.env`, and budget for the paid tier early rather than the free tier —
this is a public product with real traffic and paying customers, not a two-user internal tool.
